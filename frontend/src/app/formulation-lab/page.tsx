"use client";

// Formulation Lab — what-if simulator that stress-tests an Ayurvedic
// formulation against Indian IP statute before money is spent filing.
// Flow (formulation-lab-flow-spec.md): doors → bench → examine → dossier,
// with the mandatory return loop objection → bench (apply remedy).

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BotanicalItem,
  Directive,
  IngredientRatio,
  PresetFormulation,
  PreFERReport,
  ScenarioSummary,
  SimulationResult,
} from "@/lib/formulation/types.ts";
import { DEFAULT_BOTANICALS, OFFLINE_CATALOG, STARTER_PRESETS } from "@/lib/formulation/defaults.ts";
import { scoreCore, simulateClientFormulation } from "@/lib/formulation/engine.ts";
import { buildVerdictLine, computeNextAction, GateInput, Lens } from "@/lib/formulation/gates.ts";
import { RatioMatrixBoard } from "@/components/formulation-lab/RatioMatrixBoard";
import { LivingRasaCard } from "@/components/formulation-lab/LivingRasaCard";
import { QualityPatentabilityMatrix } from "@/components/formulation-lab/QualityPatentabilityMatrix";
import { ContributionRows } from "@/components/formulation-lab/ContributionRows";
import { EntryDoors } from "@/components/formulation-lab/EntryDoors";
import { HerbDrawer } from "@/components/formulation-lab/HerbDrawer";
import { PreFERView } from "@/components/formulation-lab/PreFERView";
import { StageTrail } from "@/components/formulation-lab/StageTrail";
import { computeStageAvailability, LabStage } from "@/lib/formulation/stages";
import { DossierView, TrajectoryPoint } from "@/components/formulation-lab/DossierView";
import { InfoTip } from "@/components/ui/InfoTip";
import { getApiUrl } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";

// Doors → bench → examine → dossier (§3); the stage trail renders this same set.
type LabView = LabStage;

const DRAFT_KEY = "ipsakti.lab.draft";

interface LabDraft {
  id: string;
  title: string;
  ingredients: IngredientRatio[];
  entityType: "domestic" | "foreign";
  entityChosen: boolean;
}

export default function FormulationLabPage() {
  const router = useRouter();

  // Catalogs — server is authority; defaults.ts is the flagged offline fallback.
  const [herbs, setHerbs] = useState<BotanicalItem[]>(DEFAULT_BOTANICALS);
  const [presets, setPresets] = useState<PresetFormulation[]>(STARTER_PRESETS);
  const [catalogOffline, setCatalogOffline] = useState<boolean>(OFFLINE_CATALOG);
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);

  // View + routing state (§3)
  const [view, setView] = useState<LabView>("doors");
  const [lens, setLens] = useState<Lens>("medicine");
  const [guided, setGuided] = useState(true);

  // Active formulation
  const [scenarioId] = useState<string>(
    () => `lab-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
  );
  const [formulationTitle, setFormulationTitle] = useState("Synergistic Ashwagandha-Shilajit-Curcumin Compound (Rev. 3.2)");
  const [activePresetId, setActivePresetId] = useState<string>("rev_3_2_benchmark");
  const [ingredients, setIngredients] = useState<IngredientRatio[]>([]);
  const [startRatios, setStartRatios] = useState<Record<string, number>>({});
  const [entityType, setEntityType] = useState<"domestic" | "foreign">("domestic");
  const [entityChosen, setEntityChosen] = useState(false);

  // Undo (one level, always adjacent to the sum chip) + trajectory + log
  const [undoState, setUndoState] = useState<{ ingredients: IngredientRatio[]; startRatios: Record<string, number> } | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [appliedLog, setAppliedLog] = useState<string[]>([]);
  const pendingPlotLabel = useRef<string | null>(null);

  // Two-speed feedback (§5.3)
  const [serverSim, setServerSim] = useState<SimulationResult | null>(null);
  const [serverFor, setServerFor] = useState<string | null>(null);
  const [serverMismatch, setServerMismatch] = useState(false);

  // Pre-FER + export
  const [preFerReport, setPreFerReport] = useState<PreFERReport | null>(null);
  const [preFerLoading, setPreFerLoading] = useState(false);
  const [preFerOffline, setPreFerOffline] = useState(false);
  const [preFerFor, setPreFerFor] = useState<string | null>(null);
  const [exportedFor, setExportedFor] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const entityControlRef = useRef<HTMLDivElement>(null);

  const herbById = useMemo(() => new Map(herbs.map((h) => [h.id, h])), [herbs]);

  // ── Boot: load catalogs, restore work (§14.7 refresh must not destroy) ────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getApiUrl();
        const [hRes, pRes, sRes] = await Promise.all([
          fetch(`${base}/api/formulation-lab/herbs`),
          fetch(`${base}/api/formulation-lab/presets`),
          fetch(`${base}/api/formulation-lab/scenarios`),
        ]);
        if (!hRes.ok || !pRes.ok) throw new Error("catalog unreachable");
        const h = (await hRes.json()) as BotanicalItem[];
        const p = (await pRes.json()) as PresetFormulation[];
        const s = sRes.ok ? ((await sRes.json()) as ScenarioSummary[]) : [];
        if (cancelled) return;
        if (h.length > 0) setHerbs(h);
        if (p.length > 0) setPresets(p);
        setScenarios(s);
        setCatalogOffline(false);
      } catch {
        if (!cancelled) setCatalogOffline(true); // static catalog, badged
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore a local draft (works even with the server down) or a ?scenario= id.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scenarioParam = params.get("scenario");
    const applyDraft = (d: LabDraft) => {
      setFormulationTitle(d.title);
      setIngredients(d.ingredients.map((i) => ({ ...i })));
      setStartRatios(Object.fromEntries(d.ingredients.map((i) => [i.herb_id, i.ratio])));
      setEntityType(d.entityType);
      setEntityChosen(d.entityChosen);
    };
    if (scenarioParam) {
      (async () => {
        try {
          const res = await fetch(`${getApiUrl()}/api/formulation-lab/scenarios/${scenarioParam}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          applyDraft({
            id: data.id,
            title: data.title,
            ingredients: data.ingredients,
            entityType: data.entity_type ?? "domestic",
            entityChosen: true,
          });
          setActivePresetId("restored");
          setView("bench");
        } catch {
          setView("doors");
        }
      })();
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as LabDraft;
        if (d.ingredients?.length) {
          applyDraft(d);
          setActivePresetId("draft");
          setView("bench");
          return;
        }
      }
    } catch {
      /* corrupt draft — fall through to doors */
    }
    setView("doors");
  }, []);

  // Guided default (§11.2): guided only when nothing was saved; session-persistent.
  useEffect(() => {
    const stored = sessionStorage.getItem("ipsakti.lab.guided");
    if (stored) setGuided(stored === "1");
  }, []);

  // ── Client instant score ───────────────────────────────────────────────────
  const clientSim = useMemo(
    () => simulateClientFormulation(formulationTitle, ingredients, entityType, herbs),
    [formulationTitle, ingredients, entityType, herbs]
  );
  const benchSignature = useMemo(
    () => JSON.stringify(ingredients.map((i) => [i.herb_id, i.ratio])) + `|${entityType}`,
    [ingredients, entityType]
  );

  // ── Debounced 400ms /simulate as authority (§5.3) ─────────────────────────
  useEffect(() => {
    if (ingredients.length === 0 || catalogOffline) return;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/formulation-lab/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formulationTitle, ingredients, entity_type: entityType }),
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as SimulationResult;
        setServerSim(data);
        setServerFor(benchSignature);
        // Mismatches are displayed, never hidden (§5.3.3)
        const mismatch =
          data.medicine_quality_score !== clientSim.medicine_quality_score ||
          data.chou_talalay_ci !== clientSim.chou_talalay_ci ||
          data.sec_3e_status !== clientSim.sec_3e_status ||
          data.tkdl_concordance_score !== clientSim.tkdl_concordance_score ||
          data.nba_abs_royalty_percentage !== clientSim.nba_abs_royalty_percentage;
        setServerMismatch(mismatch);
      } catch {
        /* server flaked — client provisional stays visible */
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benchSignature, catalogOffline]);

  const verified = serverFor === benchSignature && serverSim !== null;
  const sim = verified && serverSim ? serverSim : clientSim;

  // ── Autosave (§14.7): localStorage immediately, server when reachable ─────
  useEffect(() => {
    if (view === "doors" || ingredients.length === 0) return;
    const draft: LabDraft = { id: scenarioId, title: formulationTitle, ingredients, entityType, entityChosen };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage full — server copy still saves */
    }
    const handle = setTimeout(() => {
      fetch(`${getApiUrl()}/api/formulation-lab/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scenarioId, title: formulationTitle, ingredients, entity_type: entityType }),
      }).catch(() => undefined);
    }, 1500);
    return () => clearTimeout(handle);
  }, [ingredients, formulationTitle, entityType, entityChosen, view, scenarioId]);

  // ── §7 gate ladder — one function feeds CTA, verdict, and Guided narration ─
  const preFerCurrent = preFerFor === benchSignature && preFerReport !== null;
  const fatalCount = preFerCurrent ? preFerReport!.objections.filter((o) => o.severity === "FATAL").length : 0;
  const fatalDirectives = useMemo<Directive[]>(() => {
    if (!preFerCurrent) return [];
    const out: Directive[] = [];
    for (const o of preFerReport!.objections) {
      if (o.severity !== "FATAL") continue;
      if (o.section.includes("3(e)")) {
        const d = sim.how_to_improve.find((x) => x.herb_id === "pippali");
        out.push(d ?? { action_type: "add", herb_id: "pippali", target_ratio: 5.0, text: `Add Pippali 5.0% — ${o.remedy}` });
      } else if (o.section.includes("3(p)")) {
        const d = sim.how_to_improve.find((x) => x.herb_id === "guduchi");
        out.push(d ?? { action_type: "add", herb_id: "guduchi", target_ratio: 6.0, text: `Add Guduchi 6.0% — ${o.remedy}` });
      } else {
        out.push({ action_type: "decrease", herb_id: "pippali", target_ratio: 5.0, text: o.remedy });
      }
    }
    return out;
  }, [preFerCurrent, preFerReport, sim]);

  const gateInput: GateInput = useMemo(
    () => ({
      ingredientCount: ingredients.length,
      sim,
      entityChosen,
      preFerRun: preFerCurrent,
      fatalDirectives,
    }),
    [ingredients.length, sim, entityChosen, preFerCurrent, fatalDirectives]
  );
  const nextAction = useMemo(() => computeNextAction(gateInput), [gateInput]);
  const verdict = useMemo(() => buildVerdictLine(gateInput), [gateInput]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const snapshot = useCallback(() => {
    setUndoState({ ingredients: ingredients.map((i) => ({ ...i })), startRatios: { ...startRatios } });
  }, [ingredients, startRatios]);

  const rebalanceUnlocked = useCallback((rows: IngredientRatio[]): IngredientRatio[] => {
    const lockedSum = rows.filter((i) => i.is_locked).reduce((s, i) => s + i.ratio, 0);
    const unlocked = rows.filter((i) => !i.is_locked);
    if (unlocked.length === 0) return rows; // impossible — sum chip goes saffron, one-click normalise offered
    const remaining = Math.max(0, 100.0 - lockedSum);
    const currentUnlocked = unlocked.reduce((s, i) => s + i.ratio, 0);
    if (currentUnlocked === 0) {
      const share = Math.round((remaining / unlocked.length) * 10) / 10;
      return rows.map((i) => (i.is_locked ? i : { ...i, ratio: share }));
    }
    return rows.map((i) => {
      if (i.is_locked) return i;
      return { ...i, ratio: Math.round((i.ratio / currentUnlocked) * remaining * 10) / 10 };
    });
  }, []);

  const handleAddHerb = useCallback(
    (herbId: string, defaultRatio: number = 10.0) => {
      if (herbs.length && !herbById.has(herbId)) return;
      setIngredients((prev) => {
        if (prev.some((i) => i.herb_id === herbId)) return prev;
        snapshot();
        return rebalanceUnlocked([...prev, { herb_id: herbId, ratio: defaultRatio, is_locked: false }]);
      });
      setStartRatios((prev) => ({ ...prev, [herbId]: prev[herbId] ?? defaultRatio }));
    },
    [herbById, herbs.length, rebalanceUnlocked, snapshot]
  );

  const handleRatioChange = useCallback((herbId: string, newRatio: number) => {
    setIngredients((prev) =>
      prev.map((i) => (i.herb_id === herbId ? { ...i, ratio: Math.max(0, Math.min(100, newRatio)) } : i))
    );
  }, []);

  const handleToggleLock = useCallback((herbId: string) => {
    setIngredients((prev) => prev.map((i) => (i.herb_id === herbId ? { ...i, is_locked: !i.is_locked } : i)));
  }, []);

  const handleRemoveHerb = useCallback(
    (herbId: string) => {
      snapshot();
      setIngredients((prev) => prev.filter((i) => i.herb_id !== herbId));
    },
    [snapshot]
  );

  const handleAutoBalance = useCallback(() => {
    setIngredients((prev) => {
      snapshot();
      return rebalanceUnlocked(prev.map((i) => ({ ...i })));
    });
  }, [rebalanceUnlocked, snapshot]);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    setIngredients(undoState.ingredients);
    setStartRatios(undoState.startRatios);
    setUndoState(null);
  }, [undoState]);

  // Trajectory: each Apply plots the post-change coordinate (§7)
  useEffect(() => {
    if (pendingPlotLabel.current) {
      const label = pendingPlotLabel.current;
      pendingPlotLabel.current = null;
      setTrajectory((prev) =>
        [...prev, { quality: clientSim.medicine_quality_score, patentability: clientSim.patentability_scope_score, label }].slice(-20)
      );
    }
  }, [clientSim]);

  const applyDirective = useCallback(
    (dir: Directive) => {
      snapshot();
      pendingPlotLabel.current = dir.text || `${dir.action_type} ${dir.herb_id}`;
      setAppliedLog((prev) =>
        [...prev, `${dir.text || `${dir.action_type} ${dir.herb_id} → ${dir.target_ratio}%`}${dir.projected_impact ? ` (${dir.projected_impact})` : ""}`].slice(-20)
      );
      setIngredients((prev) => {
        let rows: IngredientRatio[];
        if (dir.action_type === "remove") {
          rows = prev.filter((i) => i.herb_id !== dir.herb_id);
        } else if (dir.action_type === "add") {
          if (prev.some((i) => i.herb_id === dir.herb_id)) {
            rows = prev.map((i) => (i.herb_id === dir.herb_id ? { ...i, ratio: dir.target_ratio } : i));
          } else {
            rows = [...prev, { herb_id: dir.herb_id, ratio: dir.target_ratio, is_locked: false }];
          }
        } else {
          rows = prev.map((i) => (i.herb_id === dir.herb_id ? { ...i, ratio: dir.target_ratio } : i));
        }
        // Apply must re-normalise or flag — never leave a silently broken composition (§7).
        return rebalanceUnlocked(rows);
      });
      setStartRatios((prev) => ({ ...prev, [dir.herb_id]: prev[dir.herb_id] ?? dir.target_ratio }));
      setDrawerOpen(false);
    },
    [rebalanceUnlocked, snapshot]
  );

  const handleNextAction = useCallback(() => {
    switch (nextAction.fire) {
      case "open_herb_drawer":
        setDrawerOpen(true);
        break;
      case "autobalance":
        handleAutoBalance();
        break;
      case "focus_entity":
        entityControlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "run_prefer":
        runPreFER();
        break;
      case "apply_remedy":
        if (nextAction.directive) applyDirective(nextAction.directive);
        break;
      case "goto_export":
        setView("dossier");
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextAction, applyDirective, handleAutoBalance]);

  // ── Preset / doors plumbing ────────────────────────────────────────────────
  const loadPreset = useCallback((preset: PresetFormulation) => {
    setFormulationTitle(preset.title);
    setActivePresetId(preset.id);
    setIngredients(preset.ingredients.map((i) => ({ ...i, is_locked: false }))); // presets never ship locked (§4.1)
    setStartRatios(Object.fromEntries(preset.ingredients.map((i) => [i.herb_id, i.ratio])));
    setUndoState(null);
    setView("bench");
  }, []);

  const startFromHerbs = useCallback((title: string, ing: IngredientRatio[]) => {
    setFormulationTitle(title);
    setActivePresetId("custom");
    setIngredients(ing.map((i) => ({ ...i, is_locked: false })));
    setStartRatios(Object.fromEntries(ing.map((i) => [i.herb_id, i.ratio])));
    setUndoState(null);
    setView("bench");
  }, []);

  const handleNewBlank = useCallback(() => {
    setFormulationTitle("Custom Compound Formulation (Draft)");
    setActivePresetId("custom_blank");
    setIngredients([]);
    setStartRatios({});
    setView("bench");
  }, []);

  const continueScenario = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/formulation-lab/scenarios/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFormulationTitle(data.title);
      setActivePresetId("restored");
      setIngredients(data.ingredients.map((i: IngredientRatio) => ({ ...i, is_locked: false })));
      setStartRatios(Object.fromEntries(data.ingredients.map((i: IngredientRatio) => [i.herb_id, i.ratio])));
      setEntityType(data.entity_type ?? "domestic");
      setEntityChosen(true);
      setView("bench");
    } catch {
      setView("doors");
    }
  }, []);

  // ── Pre-FER (explicit action, never auto-fired; entry gate §12) ───────────
  const canRunPreFer = sim.is_balanced && ingredients.length >= 3;

  function buildClientEstimatedReport(): PreFERReport {
    // §14.1: no application number, no filing date, clearly badged.
    const rej = sim.sec_3e_status === "REJECTED";
    const borderline = sim.sec_3e_status === "BORDERLINE";
    const tkdlTrap = sim.tkdl_concordance_score >= 90;
    return {
      application_no: null,
      filing_date: null,
      provenance: "CLIENT-ESTIMATED — examiner service unreachable",
      examiner_group: "Simulated IPO Group 14 (client-side rehearsal)",
      overall_patentability_score: rej ? 45 : borderline ? 70 : 92,
      summary: `Client-estimated rehearsal for '${formulationTitle}'. CI ${sim.chou_talalay_ci}, §3(e) ${sim.sec_3e_status}, §3(p) conflict ${tkdlTrap ? "YES" : "NO"}. Deterministic engine output — not an IPO response.`,
      sec_3e_synergy_verified: sim.sec_3e_status === "CLEARED",
      sec_3p_tkdl_conflict: tkdlTrap,
      objections: [
        {
          section: "Section 3(e)",
          statute: "The Patents Act, 1970",
          severity: rej ? "FATAL" : borderline ? "ADVISORY" : "OVERCOME",
          finding: rej
            ? `CI ${sim.chou_talalay_ci} fails to overcome the mere admixture bar.`
            : `CI ${sim.chou_talalay_ci} substantiates synergistic bio-potency.`,
          remedy: rej
            ? "Add standardized Pippali (>= 3% w/w) or a Ghrita lipid carrier to establish synergism."
            : "Maintain validated stoichiometric ranges within dependent claims.",
        },
        ...(tkdlTrap
          ? [{
              section: "Section 3(p)",
              statute: "The Patents Act, 1970",
              severity: "FATAL" as const,
              finding: `TKDL concordance ${sim.tkdl_concordance_score} ≥ 90 — reads as documented traditional knowledge.`,
              remedy: "Add Guduchi 6.0% w/w to drop concordance below the 90 line, or amend claims to the novel ratio.",
            }]
          : []),
        {
          section: "Section 6",
          statute: "Biological Diversity Act, 2002 (amended 2023)",
          severity: "ADVISORY",
          finding: "Use of Indian biological resources requires NBA Form III clearance before grant.",
          remedy: `File Form III reflecting the ${sim.nba_abs_royalty_percentage.toFixed(1)}% benefit-share bracket.`,
        },
      ],
      wipo_gratk_status: {
        wipo_treaty: "WIPO GRATK Treaty 2024",
        disclosure_obligation: "COMPLIANT — source of Indian biological resources documented",
        abs_clearance_status: sim.nba_form_tier,
      },
      recommended_claim_draft: [
        `1. A synergistic composition comprising ${ingredients.map((i) => `${i.herb_id} (${i.ratio}% w/w)`).join(", ")} with Chou-Talalay combination index CI < ${(sim.chou_talalay_ci + 0.1).toFixed(2)}.`,
        "2. The composition of claim 1, wherein Piper longum is present at 3.0-6.0% w/w as a pharmacokinetic bio-enhancer.",
      ],
    };
  }

  function runPreFER() {
    if (!canRunPreFer) {
      setView("bench");
      return;
    }
    setView("examine");
    setPreFerLoading(true);
    setPreFerReport(null);
    (async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/formulation-lab/pre-fer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formulation_title: formulationTitle, ingredients }),
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as PreFERReport;
        setPreFerReport({ ...data, application_no: data.application_no ?? null, filing_date: data.filing_date ?? null });
        setPreFerOffline(false);
      } catch {
        setPreFerReport(buildClientEstimatedReport());
        setPreFerOffline(true);
      } finally {
        setPreFerFor(benchSignature);
        setPreFerLoading(false);
      }
    })();
  }

  const applyObjectionRemedy = useCallback(
    (section: string) => {
      const directive =
        section.includes("3(e)")
          ? sim.how_to_improve.find((d) => d.herb_id === "pippali") ?? ({ action_type: "add", herb_id: "pippali", target_ratio: 5.0 } as Directive)
          : section.includes("3(p)")
          ? sim.how_to_improve.find((d) => d.herb_id === "guduchi") ?? ({ action_type: "add", herb_id: "guduchi", target_ratio: 6.0 } as Directive)
          : sim.what_to_remove[0];
      if (directive) applyDirective(directive as Directive);
      setView("bench"); // the objection → bench return loop is the point of the screen (§12)
    },
    [applyDirective, sim]
  );

  // ── Chat handoff (+ scenario id round-trip: ?scenario= reopens this bench) ─
  const openChatWithFormulation = useCallback(() => {
    const summaryFormula = ingredients.map((i) => `${i.herb_id}: ${i.ratio.toFixed(1)}%`).join(", ");
    const legalPrompt = `I am developing an Ayurvedic formulation: "${formulationTitle}". Composition: [${summaryFormula}]. Chou-Talalay Combination Index CI is ${sim.chou_talalay_ci.toFixed(2)} (${sim.sec_3e_status}), NBA benefit-sharing rate is ${sim.nba_abs_royalty_percentage.toFixed(1)}%, and classical treatise match is "${sim.tkdl_shloka_match}". Can you give me a full legal assessment under Indian Patents Act Sections 3(p) and 3(e), and Biological Diversity Act 2024 rules?`;
    const sessionId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`;
    localStorage.setItem("chat_session", sessionId);
    const params = new URLSearchParams({ q: legalPrompt, j: "india", session: sessionId, scenario: scenarioId });
    router.push(`/chat?${params.toString()}`);
  }, [ingredients, formulationTitle, sim, router, scenarioId]);

  // Cmd-K opens the herbarium on the bench
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && view === "bench") {
        e.preventDefault();
        setDrawerOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  // ── Sensitivity curve: quality vs the dominant hero's ratio (§3) ──────────
  const sensitivity = useMemo(() => {
    if (ingredients.length === 0) return null;
    const hero = [...ingredients].filter((i) => !i.is_locked).sort((a, b) => b.ratio - a.ratio)[0] ?? ingredients[0];
    const herb = herbById.get(hero.herb_id);
    if (!herb) return null;
    const points: { x: number; q: number }[] = [];
    const ratios = Object.fromEntries(ingredients.map((i) => [i.herb_id, i.ratio]));
    for (let k = -10; k <= 10.01; k += 2.5) {
      const trial = { ...ratios, [hero.herb_id]: Math.max(0, Math.round((hero.ratio + k) * 10) / 10) };
      const s = scoreCore(trial, entityType, herbs);
      points.push({ x: trial[hero.herb_id], q: s.medicine_quality_score });
    }
    return { herbId: hero.herb_id, name: herb.common_name, points };
  }, [ingredients, entityType, herbs, herbById]);

  // ── Dossier gate checklist (§13) — every failing gate links to its remedy ─
  const dossierGates = useMemo(() => {
    const criticals = sim.patient_safety_warnings.filter((w) => w.severity === "CRITICAL");
    return [
      { id: "count", label: "At least 3 constituents", passed: ingredients.length >= 3, remedyHint: "Open the herbarium" },
      { id: "balance", label: "Composition sums to 100.0% w/w", passed: sim.is_balanced, remedyHint: "Auto-Balance" },
      { id: "safety", label: "No CRITICAL patient-safety breach", passed: criticals.length === 0, remedyHint: "Reduce the flagged herb" },
      { id: "entity", label: "Entity type declared", passed: entityChosen, remedyHint: "Use the segmented control" },
      { id: "sec3e", label: "§3(e) synergy cleared", passed: sim.sec_3e_status === "CLEARED", remedyHint: "Add Pippali" },
      { id: "sec3p", label: "§3(p) TKDL concordance under 90", passed: sim.tkdl_concordance_score < 90, remedyHint: "Add Guduchi" },
      { id: "prefer", label: "Pre-FER run on this exact composition", passed: preFerCurrent, remedyHint: "Run Pre-FER" },
      { id: "fatal", label: "Zero FATAL objections", passed: preFerCurrent && fatalCount === 0, remedyHint: "Apply each remedy in the Bench" },
    ];
  }, [sim, ingredients.length, entityChosen, preFerCurrent, fatalCount]);

  const staleAfterExport = exportedFor !== null && exportedFor !== benchSignature;

  // ── Stage trail (§3) — availability is the ladder's own predicates, so a crumb
  //    can never unlock something the CTA says is unmet. Locked crumbs display the
  //    reason instead of disappearing (§11.1).
  const stageAvailability = useMemo(
    () =>
      computeStageAvailability({
        ingredientCount: ingredients.length,
        isBalanced: sim.is_balanced,
        totalRatio: sim.total_ratio,
        canRunPreFer,
        // A report exists this session, even if the bench moved under it — the
        // dossier shows staleness rather than locking the crumb again (§13).
        preFerSeen: preFerReport !== null,
        onBench: ingredients.length > 0 || view !== "doors",
      }),
    [ingredients.length, sim.is_balanced, sim.total_ratio, canRunPreFer, preFerReport, view]
  );

  const handleStageNavigate = useCallback(
    (next: LabStage) => {
      if (next === view || !stageAvailability[next].unlocked) return;
      if (next === "examine") {
        // Clicking the crumb is the explicit action (§12) — Pre-FER never auto-fires.
        runPreFER();
        return;
      }
      setView(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, stageAvailability]
  );

  const stageTrail = view !== "doors" ? (
    <StageTrail stage={view} availability={stageAvailability} onNavigate={handleStageNavigate} />
  ) : null;

  // ── KPI tiles — ordered by lens; every lens keeps every tile reachable ────
  const kpiTiles = useMemo(() => {
    const tiles: Record<string, React.ReactNode> = {
      quality: (
        <KpiTile key="quality" label="Medicine Quality" value={`${sim.medicine_quality_score}`} sub="/ 99 clinical composite"
          verified={verified} mismatch={serverMismatch}
          caption={verdict} captionEmphasized
          tip={<InfoTip title="Medicine Quality" statute="Composite of bioavailability, anti-inflammatory load, layer completeness & safety (Ayurvedic Pharmacopoeia ceilings)"
            mechanism="Scored deterministically from Chou-Talalay CI, Yogavāhī multiplier, NF-κB suppression, tridosha coverage and patient-safety ceilings. Server-verified values supersede live estimates."
            confidence={0.71} sourceHref="/rules" sourceLabel="Open §3(e) rules text" />} />
      ),
      synergy: (
        <KpiTile key="synergy" label="Synergy Index (CI)" value={sim.chou_talalay_ci.toFixed(2)}
          sub={sim.sec_3e_status === "CLEARED" ? "✓ clears §3(e)" : "🛑 §3(e) risk"}
          caption={`Below 1.0 the combination beats the sum of its parts — the statutory test for ${sim.ci_interpretation.toLowerCase()}.`}
          verified={verified} mismatch={serverMismatch}
          tip={<InfoTip title="Chou-Talalay Combination Index" statute="The Patents Act 1970, §3(e) — mere admixture bar"
            mechanism={`CI ${sim.chou_talalay_ci}: ${sim.ci_interpretation}. Below 0.75 the IPO treats aggregation of properties as rebutted.`}
            confidence={0.83} sourceHref="/rules" />} />
      ),
      tkdl: (
        <KpiTile key="tkdl" label="TKDL Concordance" value={`${sim.tkdl_concordance_score}`} sub={sim.tkdl_concordance_score >= 90 ? "🛑 ≥90 = §3(p) prior art" : "under the 90 line"}
          caption={`Matched canon: ${sim.tkdl_shloka_match}. At or above 90 the examiner may treat this as documented traditional knowledge.`}
          verified={verified} mismatch={serverMismatch}
          tip={<InfoTip title="TKDL Concordance" statute="The Patents Act 1970, §3(p) — traditional knowledge"
            mechanism="String and ratio similarity against digitised Charaka/Sushruta/Bhavaprakasha entries via the india_tkdl corpus."
            confidence={0.77} sourceHref="/tkdl" sourceLabel="Open the TKDL concordance" />} />
      ),
      royalty: (
        <KpiTile key="royalty" label="NBA Benefit-Share" value={`${sim.nba_abs_royalty_percentage.toFixed(1)}%`} sub={sim.nba_form_tier.split(" (")[0]}
          caption={`Cost ₹${(sim.cost_per_unit ?? 0).toFixed(2)}/unit · ${entityType} entity. ${entityType === "foreign" ? "Form I + PRI approval" : "Form III fast-track"}.`}
          verified={verified} mismatch={serverMismatch}
          tip={<InfoTip title="ABS Benefit-Share" statute="Biological Diversity Act 2002 (amended 2023), §6 & NBA Rule 13"
            mechanism="Domestic filings range 3.0-5.0%; mineral/threatened burden and foreign participation push the bracket to 5.0% and Form I."
            confidence={0.9} sourceHref="/patents" sourceLabel="Open the patent corpus" />} />
      ),
    };
    const order: Record<Lens, string[]> = {
      medicine: ["quality", "synergy", "tkdl", "royalty"],
      law: ["synergy", "tkdl", "quality", "royalty"],
      money: ["royalty", "quality", "synergy", "tkdl"],
    };
    return order[lens].map((k) => tiles[k]);
  }, [sim, verified, serverMismatch, verdict, entityType, lens]);

  // Guided mode dims panels outside the lens focus (never hides — §11.1/§11.2)
  const dim = (primary: boolean) =>
    guided && !primary ? "opacity-60 transition-opacity" : "transition-opacity";

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-background text-on-surface">
      {catalogOffline && view !== "doors" && (
        <div className="bg-tertiary-fixed/60 border-b border-emblem-gold/40 px-4 py-1.5 text-center text-xs font-bold text-on-tertiary-fixed">
          Static catalog — lab service unreachable. Scores are client-estimated; nothing here is server-verified.
        </div>
      )}

      {view === "doors" && (
        <EntryDoors
          herbs={herbs}
          presets={presets}
          scenarios={scenarios}
          catalogOffline={catalogOffline}
          onSelectPreset={loadPreset}
          onStartFromHerbs={startFromHerbs}
          onContinue={continueScenario}
          onNewBlank={handleNewBlank}
        />
      )}

      {view === "bench" && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {stageTrail}

          {/* Sub-header banner — the lab's signature element (§3/§10) */}
          <div className="rounded-xl overflow-hidden border border-tiranga-saffron/40 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-tiranga-saffron via-white to-tiranga-green" />
            <div className="bg-gradient-to-r from-tertiary-fixed/80 via-tertiary-fixed/40 to-secondary-container/40 px-4 py-3 flex flex-wrap items-center gap-3">
              <input
                value={formulationTitle}
                onChange={(e) => setFormulationTitle(e.target.value)}
                aria-label="Active formulation title"
                className="min-w-0 max-w-md flex-1 bg-transparent border-b border-transparent hover:border-tiranga-saffron/40 focus:border-tiranga-saffron focus:outline-none font-bold text-base text-portal-navy-deep"
              />
              <span className="text-xs font-mono font-bold text-portal-navy-deep bg-surface-container-lowest/70 border border-portal-border/60 rounded px-2 py-1">
                CI {sim.chou_talalay_ci} · {sim.tier.replace("_", " ")}
              </span>
              {verified ? (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${serverMismatch ? "bg-error-container text-on-error-container border-error/40" : "bg-secondary-container/70 text-on-secondary-container border-tiranga-green/40"}`}>
                  <span className="material-symbols-outlined text-[14px]">{serverMismatch ? "difference" : "verified"}</span>
                  {serverMismatch ? "client ≠ server — displayed" : "server-verified ✓"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-surface-container-lowest/70 border border-portal-border/60 text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-tiranga-saffron animate-pulse" />
                  live (provisional)
                </span>
              )}

              {/* Lens switch (§11.1) — order and emphasis, never availability */}
              <div className="flex items-center gap-1 bg-surface-container-lowest/70 border border-portal-border/60 rounded-lg p-0.5" role="tablist" aria-label="Reading lens">
                {(["medicine", "law", "money"] as Lens[]).map((l) => (
                  <button
                    key={l}
                    role="tab"
                    aria-selected={lens === l}
                    onClick={() => setLens(l)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                      lens === l ? "bg-primary-container text-surface-container-lowest" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Guided ⟷ Free (§11.2) */}
              <button
                onClick={() => {
                  setGuided((v) => {
                    sessionStorage.setItem("ipsakti.lab.guided", v ? "0" : "1");
                    return !v;
                  });
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-portal-border/60 bg-surface-container-lowest/70 text-on-surface-variant hover:text-primary"
                title={guided ? "Guided narrates the one next action" : "Free shows the whole bench"}
              >
                {guided ? "Guided ⟷ free" : "Free ⟷ guided"}
              </button>

              {/* Adaptive next action — the single primary CTA (§7) */}
              <button
                onClick={handleNextAction}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">navigate_next</span>
                next: {nextAction.label}
                {nextAction.directive && <span className="ml-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/20 text-xs">Apply</span>}
              </button>
            </div>
            {nextAction.impact && (
              <p className="px-4 py-1.5 text-xs text-on-surface-variant bg-surface-container-lowest border-t border-portal-border/40">
                If you press Apply: <span className="font-mono font-semibold text-portal-navy-deep">{nextAction.impact}</span> — projected before clicking (§7).
              </p>
            )}
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{kpiTiles}</div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* LEFT: composition */}
            <div className="xl:col-span-7 space-y-4">
              <RatioMatrixBoard
                ingredients={ingredients}
                botanicals={herbs}
                startRatios={startRatios}
                onRatioChange={handleRatioChange}
                onToggleLock={handleToggleLock}
                onRemoveHerb={handleRemoveHerb}
                onAutoBalance={handleAutoBalance}
                onUndo={handleUndo}
                canUndo={undoState !== null}
                onOpenHerbDrawer={() => setDrawerOpen(true)}
                totalRatio={sim.total_ratio}
                isBalanced={sim.is_balanced}
              />

              {/* Entity type lives on the bench, not at export (§5.1) */}
              <div ref={entityControlRef} className={`rounded-xl border p-3 flex flex-wrap items-center gap-3 ${entityChosen && entityType === "foreign" ? "border-emblem-gold/60 bg-tertiary-fixed/30" : "border-portal-border/60 bg-surface-container-lowest"}`}>
                <span className="text-sm font-bold text-portal-navy-deep inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  Entity type
                  {!entityChosen && <span className="text-xs font-bold text-tiranga-saffron-deep px-1.5 py-0.5 rounded bg-tertiary-fixed/60">not declared — gate §7.4</span>}
                </span>
                <div className="flex gap-1 bg-surface-container rounded-lg p-1 border border-portal-border/50">
                  {(["domestic", "foreign"] as const).map((et) => (
                    <button
                      key={et}
                      onClick={() => {
                        setEntityType(et);
                        setEntityChosen(true);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                        entityType === et ? "bg-primary-container text-surface-container-lowest shadow-xs" : "text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      {et === "domestic" ? "Domestic — Form III · 3.0-3.5%" : "Foreign — Form I · 5.0%"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={dim(lens === "medicine" || lens === "law")}>
                <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tiranga-saffron">handyman</span>
                  Per-herb contribution — who did what
                </h3>
                <ContributionRows
                  simulation={sim}
                  ingredients={ingredients}
                  herbs={herbs}
                  onApplyFix={applyDirective}
                  onAddHerb={handleAddHerb}
                />
              </div>
            </div>

            {/* RIGHT: verdict side */}
            <div className="xl:col-span-5 space-y-4">
              <LivingRasaCard simulation={sim} />

              {/* Safety bars, sorted (§3 anatomy) */}
              <div className={dim(lens === "medicine")}>
                <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">medical_services</span>
                  Patient safety
                </h3>
                {sim.patient_safety_warnings.length === 0 ? (
                  <p className="text-sm text-on-surface-variant rounded-lg border border-tiranga-green/40 bg-secondary-container/30 p-3">
                    ✓ No constituent breaches its documented ceiling at current ratios.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sim.patient_safety_warnings.map((w, i) => {
                      const ceiling = herbById.get(w.herb_id)?.safety_ceiling_percent ?? w.current_dose_percent;
                      const pct = Math.min(100, (w.current_dose_percent / Math.max(ceiling, 0.001)) * 100);
                      return (
                        <div key={i} className={`rounded-lg border p-2.5 ${w.severity === "CRITICAL" ? "border-error/50 bg-error-container/40" : w.severity === "WARNING" ? "border-tiranga-saffron/50 bg-tertiary-fixed/40" : "border-portal-border/60 bg-surface-container-lowest"}`}>
                          <div className="flex justify-between items-baseline text-sm">
                            <b className="text-portal-navy-deep">{w.herb_name.split(" (")[0]}</b>
                            <span className="font-mono text-xs">{w.severity === "CRITICAL" ? "🛑" : "⚠"} {w.current_dose_percent}% / ≤{ceiling}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden mt-1.5">
                            <span className={w.severity === "CRITICAL" ? "block h-full bg-error" : "block h-full bg-tiranga-saffron"} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">{w.hazard}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quadrant mini-map (§16: hero treatment demoted to optional map) */}
              <div className={dim(lens === "law")}>
                <QualityPatentabilityMatrix simulation={sim} />
              </div>

              {/* Sensitivity curve */}
              {sensitivity && (
                <div className={dim(false)}>
                  <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep mb-1">
                    Sensitivity — quality vs {sensitivity.name} %
                  </h3>
                  <div className="rounded-lg border border-portal-border/60 bg-surface-container-lowest p-3">
                    <svg viewBox="0 0 220 70" className="w-full h-20">
                      <polyline
                        fill="none"
                        stroke="#C0392B"
                        strokeWidth="2"
                        points={sensitivity.points
                          .map((p) => {
                            const xs = sensitivity.points.map((x) => x.x);
                            const minX = Math.min(...xs), maxX = Math.max(...xs);
                            const x = 10 + ((p.x - minX) / Math.max(maxX - minX, 0.001)) * 200;
                            const y = 65 - ((p.q - 0) / 99) * 55;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {sensitivity.points.map((p, i) => {
                        const xs = sensitivity.points.map((x) => x.x);
                        const minX = Math.min(...xs), maxX = Math.max(...xs);
                        const x = 10 + ((p.x - minX) / Math.max(maxX - minX, 0.001)) * 200;
                        const y = 65 - (p.q / 99) * 55;
                        return <circle key={i} cx={x} cy={y} r="2" fill={p.q >= 70 ? "#1A7F4E" : "#C0392B"} />;
                      })}
                    </svg>
                    <p className="text-xs text-outline">Drag {sensitivity.name} across the bench and watch this line — the what-if, before money.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom rail: exits (§11.3) */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-portal-border/60 bg-surface-container-lowest p-3 shadow-sm">
            <p className="text-sm text-on-surface-variant max-w-xl">
              <span className="font-bold text-portal-navy-deep">Guided: </span>
              {guided ? "one action at a time — the button above is the highest-consequence unmet gate." : "Free mode: whole bench visible; the ladder still ranks the gates."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView("doors")}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant"
              >
                ⌂ Change starting point
              </button>
              <button
                onClick={openChatWithFormulation}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-primary bg-portal-surface-subtle hover:bg-surface-container text-primary inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                Discuss in Legal Advisor
              </button>
              <button
                onClick={() => router.push("/wizard")}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant inline-flex items-center gap-1.5"
                title="Udyam · Form III · Schedule T · GST"
              >
                <span className="material-symbols-outlined text-[17px]">alt_route</span>
                Licence path →
              </button>
              <button
                onClick={runPreFER}
                disabled={!canRunPreFer}
                title={canRunPreFer ? "Simulated First Examination Report" : "Gate §12: sum must be 100% and ≥3 constituents"}
                className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${
                  canRunPreFer
                    ? "bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep"
                    : "bg-surface-container text-outline cursor-not-allowed opacity-60"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">gavel</span>
                Run Pre-FER →
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "examine" && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-4">
          {stageTrail}
          <PreFERView
            report={preFerReport}
            isLoading={preFerLoading}
            offlineEstimated={preFerOffline}
            onApplyRemedy={applyObjectionRemedy}
            onDiscuss={openChatWithFormulation}
            onBackToBench={() => setView("bench")}
          />
        </div>
      )}

      {view === "dossier" && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-4">
          {stageTrail}
          <DossierView
            simulation={sim}
            ingredients={ingredients}
            herbs={herbs}
            preFerReport={preFerCurrent ? preFerReport : null}
            fatalCount={fatalCount}
            gates={dossierGates}
            trajectory={trajectory}
            appliedLog={appliedLog}
            staleAfterExport={staleAfterExport}
            exportedOnce={exportedFor !== null}
            lens={lens}
            onJumpToRemedy={() => setView("bench")}
            onBackToBench={() => setView("bench")}
            onExported={() => setExportedFor(benchSignature)}
          />
        </div>
      )}

      <HerbDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        herbs={herbs}
        existingIds={new Set(ingredients.map((i) => i.herb_id))}
        onAdd={handleAddHerb}
      />
    </div>
  );

  function KpiTile({
    label,
    value,
    sub,
    caption,
    tip,
    verified: v,
    mismatch,
    captionEmphasized,
  }: {
    label: string;
    value: string;
    sub?: string;
    caption: string;
    tip: React.ReactNode;
    verified: boolean;
    mismatch: boolean;
    captionEmphasized?: boolean;
  }) {
    return (
      <div className={`rounded-xl border bg-surface-container-lowest p-3.5 shadow-sm space-y-1 ${mismatch ? "border-error/50" : "border-portal-border/60"}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-outline truncate">{label}</span>
          <span className="flex items-center gap-1.5 shrink-0">
            {v ? (
              <span className={`text-xs font-bold ${mismatch ? "text-error" : "text-tiranga-green-deep"}`}>{mismatch ? "≠ server" : "✓"}</span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-tiranga-saffron animate-pulse" title="live provisional client score" />
            )}
            {tip}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] leading-none font-bold text-portal-navy-deep tabular-nums">{value}</span>
          {sub && <span className={`text-xs font-semibold ${sub.startsWith("🛑") ? "text-error" : "text-outline"}`}>{sub}</span>}
        </div>
        {/* Rung 2: plain-language caption, always on, zero clicks, ≥12px (§9) */}
        <p className={`text-xs leading-relaxed ${captionEmphasized ? "font-semibold text-portal-navy-deep" : "text-on-surface-variant"}`}>{caption}</p>
      </div>
    );
  }
}
