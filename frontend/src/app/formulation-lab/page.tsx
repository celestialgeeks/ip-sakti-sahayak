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
import { GenesisOrbLanding } from "@/components/formulation-lab/GenesisOrbLanding";
import { RatioMatrixBoard } from "@/components/formulation-lab/RatioMatrixBoard";
import { LivingRasaCard } from "@/components/formulation-lab/LivingRasaCard";
import { StatutoryAccordions } from "@/components/formulation-lab/StatutoryAccordions";
import { OptimizationToast } from "@/components/formulation-lab/OptimizationToast";
import { PreFERModal } from "@/components/formulation-lab/PreFERModal";
import { DossierExportModal } from "@/components/formulation-lab/DossierExportModal";
import { getApiUrl } from "@/lib/api";

export default function FormulationLabPage() {
  const router = useRouter();

  // Botanical & Preset catalogs
  const [botanicals] = useState<BotanicalItem[]>(DEFAULT_BOTANICALS);
  const [presets] = useState<PresetFormulation[]>(STARTER_PRESETS);

  // Landing vs Active Workbench mode
  const [isGenesisLanding, setIsGenesisLanding] = useState<boolean>(true);

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

  // Handler: Select Starter Preset from Genesis or Switcher
  const handleSelectPreset = useCallback(
    (preset: PresetFormulation) => {
      setFormulationTitle(preset.title);
      setActivePresetId(preset.id);
      setIngredients(preset.ingredients.map((i) => ({ ...i })));
      setBaselineRatios({ ...preset.baseline_ratios });
      setIsGenesisLanding(false);
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
    setIsGenesisLanding(false);
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
          `1. A synergistic Ayurvedic pharmaceutical composition comprising: ${ingredients
            .map((i) => `${i.herb_id} (${i.ratio.toFixed(1)}% w/w)`)
            .join(", ")}, wherein the Combination Index CI < ${(simulation.chou_talalay_ci + 0.1).toFixed(2)}.`,
          "2. The composition as claimed in claim 1, exhibiting at least 2.5x enhanced mucosal bioavailability.",
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
    <div className="w-full min-h-[calc(100vh-95px)] bg-[#F4F6F9] text-[#111c2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Top Portal Breadcrumb & Context Bar ──────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00263f]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Ministry of Ayush · SIH26045
              </span>
              <h2 className="text-sm font-bold text-[#00263f]">
                Formulation Laboratory &amp; Ratio Impact Simulator
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {isGenesisLanding ? (
              <button
                onClick={() => setIsGenesisLanding(false)}
                className="px-3.5 py-2 rounded text-xs font-semibold bg-[#00263f] hover:bg-[#083b5c] text-white transition-colors"
              >
                Open Active Workbench →
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsGenesisLanding(true)}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  ← Setup Hub
                </button>

                <select
                  value={activePresetId}
                  onChange={(e) => {
                    const p = presets.find((pr) => pr.id === e.target.value);
                    if (p) handleSelectPreset(p);
                  }}
                  className="text-xs px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00263f]"
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* ── Main Workspace Body ──────────────────────────────────────── */}
        {isGenesisLanding ? (
          <GenesisOrbLanding
            presets={presets}
            botanicals={botanicals}
            onSelectPreset={handleSelectPreset}
            onAddHerb={handleAddHerb}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Formulation Title Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Active Formulation Title
                </span>
                <input
                  type="text"
                  value={formulationTitle}
                  onChange={(e) => setFormulationTitle(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#00263f] focus:outline-none transition-colors"
                />
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Stage Classification
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {simulation.tier_sanskrit}
                </span>
              </div>
            </div>

            {/* 2-Column Responsive Layout: Matrix (7-cols) + Technical Dossier Card (5-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
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

              <div className="lg:col-span-5 sticky top-6">
                <LivingRasaCard simulation={simulation} />
              </div>
            </div>

            {/* Structured Statutory Accordions */}
            <StatutoryAccordions
              simulation={simulation}
              onRunPreFER={handleRunPreFER}
              onExportDossier={() => setIsDossierOpen(true)}
              onOpenChatWithFormulation={handleOpenChatWithFormulation}
            />
          </div>
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
