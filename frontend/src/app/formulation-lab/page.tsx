"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BotanicalItem,
  IngredientRatio,
  PresetFormulation,
  PreFERReport,
} from "@/lib/formulation/types.ts";
import { DEFAULT_BOTANICALS, STARTER_PRESETS } from "@/lib/formulation/defaults.ts";
import { simulateClientFormulation } from "@/lib/formulation/engine.ts";
import RecursiveErosionBackground from "@/components/ui/recursive-erosion";
import { RatioMatrixBoard } from "@/components/formulation-lab/RatioMatrixBoard";
import { LivingRasaCard } from "@/components/formulation-lab/LivingRasaCard";
import { QualityPatentabilityMatrix } from "@/components/formulation-lab/QualityPatentabilityMatrix";
import { PatientSafetyPanel } from "@/components/formulation-lab/PatientSafetyPanel";
import { ProsAndConsPanel } from "@/components/formulation-lab/ProsAndConsPanel";
import { OptimizationDirectivesPanel } from "@/components/formulation-lab/OptimizationDirectivesPanel";
import { StatutoryAccordions } from "@/components/formulation-lab/StatutoryAccordions";
import { OptimizationToast } from "@/components/formulation-lab/OptimizationToast";
import { PreFERModal } from "@/components/formulation-lab/PreFERModal";
import { DossierExportModal } from "@/components/formulation-lab/DossierExportModal";
import { getApiUrl } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";

export default function FormulationLabPage() {
  const router = useRouter();

  // Botanical & Preset catalogs
  const [botanicals] = useState<BotanicalItem[]>(DEFAULT_BOTANICALS);
  const [presets] = useState<PresetFormulation[]>(STARTER_PRESETS);

  // Active formulation state
  const [formulationTitle, setFormulationTitle] = useState<string>(
    "Synergistic Ashwagandha-Shilajit-Curcumin Compound (Rev. 3.2)"
  );
  const [activePresetId, setActivePresetId] = useState<string>("rev_3_2_benchmark");
  const [ingredients, setIngredients] = useState<IngredientRatio[]>(
    STARTER_PRESETS[3].ingredients
  );
  const [baselineRatios, setBaselineRatios] = useState<Record<string, number>>(
    STARTER_PRESETS[3].baseline_ratios
  );

  // Modals state
  const [isPreFEROpen, setIsPreFEROpen] = useState<boolean>(false);
  const [isPreFERLoading, setIsPreFERLoading] = useState<boolean>(false);
  const [preFERReport, setPreFERReport] = useState<PreFERReport | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // Toast recommendation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bottom analysis rail: which detail panel is shown
  const [detailTab, setDetailTab] = useState<
    "quadrant" | "safety" | "proscons" | "directives" | "statutory"
  >("quadrant");

  // Instant client simulation computation (0ms reactivity)
  const simulation = useMemo(() => {
    return simulateClientFormulation(formulationTitle, ingredients, "domestic");
  }, [formulationTitle, ingredients]);

  // Set toast message on simulation change if suggestions available
  useEffect(() => {
    if (simulation.suggestions && simulation.suggestions.length > 0) {
      setToastMessage(simulation.suggestions[0]);
    } else {
      setToastMessage(null);
    }
  }, [simulation.suggestions]);

  // Handler: Start with blank custom formulation
  const handleStartBlank = useCallback(() => {
    setFormulationTitle("Custom Compound Formulation (Draft)");
    setActivePresetId("custom_draft");
    setIngredients([]);
    setBaselineRatios({});
  }, []);

  // Handler: Select Starter Preset from Genesis or Switcher
  const handleSelectPreset = useCallback(
    (preset: PresetFormulation) => {
      setFormulationTitle(preset.title);
      setActivePresetId(preset.id);
      setIngredients(preset.ingredients.map((i) => ({ ...i })));
      setBaselineRatios({ ...preset.baseline_ratios });
    },
    []
  );

  // Handler: Add herb to formula
  const handleAddHerb = useCallback((herbId: string, defaultRatio: number = 10.0) => {
    setIngredients((prev) => {
      if (prev.some((i) => i.herb_id === herbId)) return prev;
      return [...prev, { herb_id: herbId, ratio: defaultRatio, is_locked: false }];
    });
    setBaselineRatios((prev) => ({
      ...prev,
      [herbId]: prev[herbId] ?? defaultRatio,
    }));
  }, []);

  // Handler: Modify herb ratio
  const handleRatioChange = useCallback((herbId: string, newRatio: number) => {
    setIngredients((prev) =>
      prev.map((i) =>
        i.herb_id === herbId ? { ...i, ratio: Math.max(0, Math.min(100, newRatio)) } : i
      )
    );
  }, []);

  // Handler: Toggle lock on herb
  const handleToggleLock = useCallback((herbId: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.herb_id === herbId ? { ...i, is_locked: !i.is_locked } : i))
    );
  }, []);

  // Handler: Remove herb
  const handleRemoveHerb = useCallback((herbId: string) => {
    setIngredients((prev) => prev.filter((i) => i.herb_id !== herbId));
  }, []);

  // Handler: Auto-balance unlocked ingredients to equal 100%
  const handleAutoBalance = useCallback(() => {
    setIngredients((prev) => {
      const lockedSum = prev
        .filter((i) => i.is_locked)
        .reduce((sum, i) => sum + i.ratio, 0);

      const unlocked = prev.filter((i) => !i.is_locked);
      if (unlocked.length === 0) return prev;

      const remainingPercentage = Math.max(0, 100.0 - lockedSum);
      const currentUnlockedSum = unlocked.reduce((sum, i) => sum + i.ratio, 0);

      if (currentUnlockedSum === 0) {
        const equalShare = Math.round((remainingPercentage / unlocked.length) * 10) / 10;
        return prev.map((i) => (i.is_locked ? i : { ...i, ratio: equalShare }));
      }

      return prev.map((i) => {
        if (i.is_locked) return i;
        const normalized =
          Math.round(((i.ratio / currentUnlockedSum) * remainingPercentage) * 10) / 10;
        return { ...i, ratio: normalized };
      });
    });
  }, []);

  // Handler: Reset to baseline ratios
  const handleResetBaseline = useCallback(() => {
    setIngredients((prev) =>
      prev.map((i) => ({
        ...i,
        ratio: baselineRatios[i.herb_id] ?? i.ratio,
      }))
    );
  }, [baselineRatios]);

  // Handler: Apply 1-click optimization directives
  const handleApplyDirective = useCallback(
    (
      actionType: "add" | "increase" | "decrease" | "remove",
      herbId: string,
      targetRatio: number
    ) => {
      if (actionType === "add") {
        handleAddHerb(herbId, targetRatio);
      } else if (actionType === "increase" || actionType === "decrease") {
        handleRatioChange(herbId, targetRatio);
      } else if (actionType === "remove") {
        handleRemoveHerb(herbId);
      }
    },
    [handleAddHerb, handleRatioChange, handleRemoveHerb]
  );

  // Handler: Apply Toast recommendation
  const handleApplyToastSuggestion = useCallback(() => {
    if (!toastMessage) return;
    if (toastMessage.includes("Pippali")) {
      handleAddHerb("pippali", 5.0);
    } else if (toastMessage.includes("Guduchi")) {
      handleAddHerb("guduchi", 5.0);
    } else if (toastMessage.includes("Ghrita")) {
      handleRatioChange("ghee", 15.0);
    }
    setToastMessage(null);
  }, [toastMessage, handleAddHerb, handleRatioChange]);

  // Handler: Run Pre-FER Patent Examination
  const handleRunPreFER = async () => {
    setIsPreFEROpen(true);
    setIsPreFERLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/formulation-lab/pre-fer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulation_title: formulationTitle,
          ingredients,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreFERReport(data);
      } else {
        throw new Error("Failed to fetch Pre-FER");
      }
    } catch {
      // Local fallback simulation if server is offline
      setPreFERReport({
        application_no: "IN/2026/AYUSH/049812",
        filing_date: "2026-09-24",
        examiner_group: "Ayurvedic Biotechnology & Phytopharmaceuticals Group 14",
        overall_patentability_score: simulation.sec_3e_status === "CLEARED" ? 92 : 48,
        summary: `Simulated First Examination Report for '${formulationTitle}'. Combination index verified at ${simulation.chou_talalay_ci.toFixed(2)}. Section 3(e) status: ${simulation.sec_3e_status}.`,
        sec_3e_synergy_verified: simulation.sec_3e_status === "CLEARED",
        sec_3p_tkdl_conflict: simulation.tkdl_concordance_score >= 90,
        objections: [
          {
            section: "Section 3(e)",
            statute: "The Patents Act, 1970",
            severity: simulation.sec_3e_status === "CLEARED" ? "OVERCOME" : "FATAL",
            finding:
              simulation.sec_3e_status === "CLEARED"
                ? `Combination Index of ${simulation.chou_talalay_ci.toFixed(2)} substantiates super-additive synergistic bio-potency.`
                : `Combination Index of ${simulation.chou_talalay_ci.toFixed(2)} fails to overcome the statutory mere admixture bar.`,
            remedy:
              simulation.sec_3e_status === "CLEARED"
                ? "Maintain validated stoichiometric ranges within dependent claims."
                : "Add standardized Piperine (Pippali >= 3%) or Vedic Cow Ghrita liposomal adjuvant to establish synergism.",
          },
          {
            section: "Section 6",
            statute: "Biological Diversity Act, 2002 (amended 2023)",
            severity: "ADVISORY",
            finding: "Sourcing of Indian biological resources requires mandatory Form III clearance prior to patent grant.",
            remedy: `Submit Form III to NBA Chennai reflecting the ${simulation.nba_abs_royalty_percentage.toFixed(1)}% commercial return bracket.`,
          },
        ],
        wipo_gratk_status: {
          wipo_treaty: "WIPO GRATK Treaty 2024",
          disclosure_obligation: "COMPLIANT — Source of Indian biological resources documented",
          abs_clearance_status: simulation.nba_form_tier,
        },
        recommended_claim_draft: [
          `1. A synergistic pharmaceutical composition comprising standardized Withania somnifera extract, purified Asphaltum punjabianum, Curcuma longa extract, characterized in that the constituents are compounded in a stoichiometric ratio having a Chou-Talalay combination index CI < 0.75.`,
          `2. The composition of claim 1, further comprising Piper longum (3.0% to 6.0% w/w) acting as a pharmacokinetic bio-availability enhancer.`,
        ],
      });
    } finally {
      setIsPreFERLoading(false);
    }
  };

  // Handler: 1-Click Consult IP-SAKTI Chat with Formulation Payload
  const handleOpenChatWithFormulation = () => {
    const summaryFormula = ingredients
      .map((i) => `${i.herb_id}: ${i.ratio.toFixed(1)}%`)
      .join(", ");
    const legalPrompt = `I am developing an Ayurvedic formulation: "${formulationTitle}". Composition: [${summaryFormula}]. Chou-Talalay Combination Index CI is ${simulation.chou_talalay_ci.toFixed(2)} (${simulation.sec_3e_status}), NBA benefit-sharing rate is ${simulation.nba_abs_royalty_percentage.toFixed(1)}%, and classical treatise match is "${simulation.tkdl_shloka_match}". Can you give me a full legal assessment under Indian Patents Act Sections 3(p) and 3(e), and Biological Diversity Act 2024 rules?`;

    const newSessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session_${Date.now()}`;
    localStorage.setItem("chat_session", newSessionId);

    const params = new URLSearchParams({
      q: legalPrompt,
      j: "india",
      session: newSessionId,
    });
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-95px)] bg-background text-on-surface font-body-md">
      <div className="max-w-[1600px] mx-auto px-space-md sm:px-gutter lg:px-margin py-4 space-y-4">
        {/* ── Slim Command Header (current formula name) ─────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-container-lowest border border-portal-border/60 rounded-xl px-4 py-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tiranga-saffron via-surface-container-lowest to-tiranga-green opacity-90" />
          <div className="flex items-center gap-3 min-w-0 pl-1">
            <div className="w-10 h-10 rounded-lg bg-primary text-surface-container-lowest grid place-items-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">science</span>
            </div>
            <div className="min-w-0">
              <input
                type="text"
                value={formulationTitle}
                onChange={(e) => setFormulationTitle(e.target.value)}
                aria-label="Active formulation title"
                className="w-full max-w-md text-base font-bold text-portal-navy-deep font-title-lg border-b border-transparent hover:border-portal-border focus:border-primary focus:outline-none transition-colors bg-transparent"
              />
              <span className="text-[10px] font-label-sm uppercase tracking-wider text-outline">Active Formulation · live in silico</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pl-1">
            <span className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-label-sm font-label-sm font-semibold ${simulation.sec_3e_status === "CLEARED" ? "bg-secondary-container/40 text-on-secondary-container border-secondary-container" : "bg-tertiary-fixed/50 text-on-tertiary-fixed border-emblem-gold/40"}`}>
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {simulation.sec_3e_status === "CLEARED" ? "§3(e) Cleared" : "§3(e) In Review"}
            </span>
            <button
              onClick={handleStartBlank}
              className="px-3 py-2 rounded-lg text-label-sm font-label-sm font-semibold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              New
            </button>
            <button
              onClick={handleRunPreFER}
              className="px-3.5 py-2 rounded-lg text-label-sm font-label-sm font-semibold bg-primary-container hover:bg-portal-navy-deep text-surface-container-lowest transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              Run Pre-FER
            </button>
          </div>
        </div>

        {/* ── Primary Workspace: core + potency (left) · metrics + ingredients (right) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* LEFT: recursive-erosion animation on top, synergy potency meter below */}
          <div className="xl:col-span-5 space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-outline-variant/30 bg-[#0a0908] h-[220px]">
              <RecursiveErosionBackground mode="dark" className="absolute inset-0 h-full w-full" />
              <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-portal-navy-deep/80 border border-outline-variant/30 text-surface-container-lowest text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${simulation.is_balanced ? "bg-tiranga-green" : "bg-tiranga-saffron"} animate-ping`} />
                PRĀṆA CORE
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/70 to-transparent">
                <div className="flex items-end justify-between text-surface-container-lowest">
                  <div>
                    <div className="text-[10px] font-label-sm uppercase text-surface-variant">Ojas Potency</div>
                    <div className="font-headline-md text-headline-md font-bold leading-none">{simulation.ojas_power_score.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-label-sm uppercase text-surface-variant">CI</div>
                    <div className={`font-title-lg text-title-lg font-bold font-mono ${simulation.sec_3e_status === "CLEARED" ? "text-tiranga-green" : "text-tiranga-saffron"}`}>{simulation.chou_talalay_ci.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
            <LivingRasaCard simulation={simulation} />
          </div>

          {/* RIGHT: compact metrics · preset loader · ingredients matrix */}
          <div className="xl:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "Compound Total", value: `${simulation.total_ratio.toFixed(1)}%`, sub: "/ 100", chip: simulation.is_balanced ? "Balanced" : "Unbalanced", chipColor: simulation.is_balanced ? "bg-secondary-container/50 text-on-secondary-container" : "bg-error-container/60 text-on-error-container", barPct: Math.min(100, simulation.total_ratio), barColor: simulation.is_balanced ? "bg-tiranga-green" : "bg-error" },
                { label: "Synergy Index", value: simulation.chou_talalay_ci.toFixed(2), sub: "CI", chip: simulation.sec_3e_status === "CLEARED" ? "§3(e) Cleared" : "§3(e) Risk", chipColor: simulation.sec_3e_status === "CLEARED" ? "bg-secondary-container/50 text-on-secondary-container" : "bg-error-container/60 text-on-error-container", barPct: Math.max(0, Math.min(100, (1 - simulation.chou_talalay_ci) * 100)), barColor: simulation.sec_3e_status === "CLEARED" ? "bg-tiranga-green-deep" : "bg-error" },
                { label: "TKDL Concordance", value: `${simulation.tkdl_concordance_score}%`, sub: "canon", chip: simulation.tkdl_concordance_score >= 90 ? "Prior-Art Risk" : "Admissible", chipColor: simulation.tkdl_concordance_score >= 90 ? "bg-tertiary-fixed/60 text-on-tertiary-fixed" : "bg-secondary-container/50 text-on-secondary-container", barPct: simulation.tkdl_concordance_score, barColor: "bg-emblem-gold" },
                { label: "NBA Benefit-Share", value: `${simulation.nba_abs_royalty_percentage.toFixed(1)}%`, sub: "ex-fty", chip: simulation.nba_form_tier, chipColor: "bg-primary-fixed text-on-primary-fixed-variant", barPct: Math.min(100, simulation.nba_abs_royalty_percentage * 10), barColor: "bg-tiranga-saffron-deep" },
              ] as const).map((k) => (
                <div key={k.label} className="rounded-lg border border-portal-border/60 bg-surface-container-lowest p-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-outline truncate">{k.label}</span>
                    <span className={`text-[10px] font-label-sm font-bold px-1.5 py-0.5 rounded shrink-0 ${k.chipColor}`}>{k.chip}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-title-lg text-title-lg font-bold text-portal-navy-deep font-mono">{k.value}</span>
                    <span className="text-[10px] text-outline">{k.sub}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1 mt-2 overflow-hidden">
                    <div className={`${k.barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${Math.max(0, Math.min(100, k.barPct))}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Preset loader */}
            <div className="flex items-center gap-2 rounded-lg border border-portal-border/60 bg-surface-container-lowest px-3 py-2 shadow-xs">
              <span className="text-[10px] font-label-sm uppercase tracking-wider text-outline shrink-0">Load preset</span>
              <Select
                value={activePresetId}
                onValueChange={(v) => {
                  const p = presets.find((pr) => pr.id === v);
                  if (p) handleSelectPreset(p);
                }}
              >
                <SelectTrigger
                  aria-label="Switch active formulation preset"
                  className="flex-1 min-w-0 rounded-lg border-portal-border bg-surface-container-lowest px-3 text-label-sm text-on-surface shadow-none data-[size=default]:h-[34px] data-[state=open]:border-tiranga-saffron"
                >
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent className="[&_[data-slot=select-item]]:text-label-sm">
                  {presets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom_draft">Custom Blank Compound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <RatioMatrixBoard
              ingredients={ingredients}
              botanicals={botanicals}
              baselineRatios={baselineRatios}
              onRatioChange={handleRatioChange}
              onToggleLock={handleToggleLock}
              onRemoveHerb={handleRemoveHerb}
              onAddHerb={handleAddHerb}
              onAutoBalance={handleAutoBalance}
              onResetBaseline={handleResetBaseline}
              totalRatio={simulation.total_ratio}
              isBalanced={simulation.is_balanced}
            />
          </div>
        </div>

        {/* ── Analysis rail (tabbed so nothing bleeds below the fold) ── */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-surface-container-lowest border border-portal-border/60 rounded-xl shadow-sm">
          {([
            { id: "quadrant", label: "Quality × Patentability", icon: "scatter_plot" },
            { id: "safety", label: "Patient Safety", icon: "medical_services" },
            { id: "proscons", label: "Pros & Cons", icon: "balance" },
            { id: "directives", label: "Directives", icon: "auto_fix_high" },
            { id: "statutory", label: "Statutory Dossier", icon: "gavel" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm font-semibold flex items-center gap-1.5 transition-colors ${
                detailTab === t.id
                  ? "bg-primary-container text-surface-container-lowest shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsDossierOpen(true)}
              className="px-3 py-1.5 rounded-lg text-label-sm font-label-sm font-semibold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              Export Dossier
            </button>
            <button
              onClick={handleOpenChatWithFormulation}
              className="px-3 py-1.5 rounded-lg text-label-sm font-label-sm font-semibold border border-primary bg-portal-surface-subtle hover:bg-surface-container text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              Consult Legal Assistant
            </button>
          </div>
        </div>

        {detailTab === "quadrant" && <QualityPatentabilityMatrix simulation={simulation} />}
        {detailTab === "safety" && <PatientSafetyPanel simulation={simulation} />}
        {detailTab === "proscons" && <ProsAndConsPanel simulation={simulation} />}
        {detailTab === "directives" && (
          <OptimizationDirectivesPanel simulation={simulation} onApplyDirective={handleApplyDirective} />
        )}
        {detailTab === "statutory" && (
          <StatutoryAccordions
            simulation={simulation}
            onRunPreFER={handleRunPreFER}
            onExportDossier={() => setIsDossierOpen(true)}
            onOpenChatWithFormulation={handleOpenChatWithFormulation}
          />
        )}

        {/* ── Modals & Notification Widgets ────────────────────────────── */}
        {toastMessage && (
          <OptimizationToast
            message={toastMessage}
            onApply={handleApplyToastSuggestion}
            onDismiss={() => setToastMessage(null)}
          />
        )}

        <PreFERModal
          isOpen={isPreFEROpen}
          onClose={() => setIsPreFEROpen(false)}
          report={preFERReport}
          isLoading={isPreFERLoading}
        />

        <DossierExportModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          simulation={simulation}
          ingredients={ingredients}
          botanicals={botanicals}
        />
      </div>
    </div>
  );
}

