"use client";

// Contribution rows (spec §5.2) — replaces ProsAndConsPanel, PatientSafetyPanel,
// and OptimizationDirectivesPanel with one attribution list. Each row names its
// OWN herb and quantifies its OWN contribution; safety breaches sort to the top.
// Colour is never the only signal (§10): every state also carries an icon + word.

import React from "react";
import { BotanicalItem, Directive, HerbLayer, IngredientRatio, SimulationResult } from "@/lib/formulation/types";

const LAYER_META: Record<HerbLayer, { label: string; icon: string }> = {
  arthin: { label: "Arthin (hero)", icon: "stars" },
  yogavahi: { label: "Yogavāhī (bio-enhancer)", icon: "bolt" },
  anupana: { label: "Anupana (carrier)", icon: "water_drop" },
  sah_caraka: { label: "Sah-caraka (counter-toxic)", icon: "shield" },
  resin_bhasma: { label: "Resin / Bhasma", icon: "landscape" },
  supportive: { label: "Supportive", icon: "local_florist" },
};

interface ContributionRowsProps {
  simulation: SimulationResult;
  ingredients: IngredientRatio[];
  herbs: BotanicalItem[];
  onApplyFix: (directive: Directive) => void;
  onAddHerb: (herbId: string, ratio: number) => void;
}

const signed = (v: number, digits = 1): string => (v > 0 ? `+${v.toFixed(digits)}` : v.toFixed(digits));

export function ContributionRows({ simulation, ingredients, herbs, onApplyFix, onAddHerb }: ContributionRowsProps) {
  const contributions = simulation.contributions ?? [];
  const herbById = new Map(herbs.map((h) => [h.id, h]));

  const severityRank: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  const sorted = [...contributions].sort((a, b) => {
    const wa = simulation.patient_safety_warnings.find((w) => w.herb_id === a.herb_id);
    const wb = simulation.patient_safety_warnings.find((w) => w.herb_id === b.herb_id);
    // Safety warnings sort to the top (§5.2), CRITICAL before WARNING.
    if (wa || wb) {
      const ra = wa ? severityRank[wa.severity] ?? 3 : 4;
      const rb = wb ? severityRank[wb.severity] ?? 3 : 4;
      if (ra !== rb) return ra - rb;
    }
    if (a.state !== b.state) {
      const order = { blocking: 0, negative: 1, positive: 2 };
      return order[a.state] - order[b.state];
    }
    return 0;
  });

  const presentLayers = new Set(contributions.map((c) => c.layer));
  const missingCoreLayers = (["arthin", "yogavahi", "anupana"] as HerbLayer[]).filter((l) => !presentLayers.has(l));

  const missingFixes: Record<string, { herbId: string; ratio: number; label: string }> = {
    yogavahi: { herbId: "pippali", ratio: 5, label: "Add Pippali 5% — the Yogavāhī layer is missing (§3(e) hinge)" },
    anupana: { herbId: "ghee", ratio: 15, label: "Add Ghrita 15% — the Anupana carrier layer is missing" },
    arthin: { herbId: "ashwagandha", ratio: 30, label: "Add a hero botanical (Arthin layer) — nothing here drives the ED50" },
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-portal-border p-6 text-center text-sm text-on-surface-variant">
        No ingredients yet. Open the herbarium (⌘K) or pick a preset to see per-herb attribution here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {missingCoreLayers.length > 0 && (
        <div className="rounded-lg border border-emblem-gold/50 bg-tertiary-fixed/40 p-3 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-on-tertiary-fixed flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">layers</span>
            Missing layer{missingCoreLayers.length > 1 ? "s" : ""} — actionable diagnosis, not just “quality went down”
          </p>
          {missingCoreLayers.map((l) => (
            <button
              key={l}
              onClick={() => onAddHerb(missingFixes[l].herbId, missingFixes[l].ratio)}
              className="block w-full text-left text-sm font-semibold text-portal-navy-deep hover:underline"
            >
              ▸ {missingFixes[l].label}
            </button>
          ))}
        </div>
      )}

      {sorted.map((c) => {
        const herb = herbById.get(c.herb_id);
        const warning = simulation.patient_safety_warnings.find((w) => w.herb_id === c.herb_id);
        const layer = LAYER_META[c.layer] ?? LAYER_META.supportive;
        const spine =
          c.state === "blocking"
            ? "bg-error"
            : c.state === "negative"
            ? "bg-tiranga-saffron"
            : "bg-tiranga-green";
        const stateChip =
          c.state === "blocking"
            ? { icon: "block", cls: "bg-error-container text-on-error-container", label: warning ? warning.severity : "Blocking" }
            : c.state === "negative"
            ? { icon: "trending_down", cls: "bg-tertiary-fixed text-on-tertiary-fixed", label: "Net negative" }
            : { icon: "trending_up", cls: "bg-secondary-container text-on-secondary-container", label: "Net positive" };

        return (
          <div
            key={c.herb_id}
            className="relative rounded-lg border border-portal-border/60 bg-surface-container-lowest pl-4 pr-3 py-2.5 overflow-hidden"
          >
            <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${spine}`} aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold text-portal-navy-deep">{herb?.common_name ?? c.herb_id}</span>
                  {herb && <span className="text-xs italic text-outline">{herb.sanskrit_name}</span>}
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${stateChip.cls}`}>
                    <span className="material-symbols-outlined text-[13px]">{stateChip.icon}</span>
                    {stateChip.label}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <span className="material-symbols-outlined text-[13px]">{layer.icon}</span>
                    {layer.label}
                  </span>
                  {herb && <span className="ml-2 font-mono">{herb.marker_compound}</span>}
                  {herb?.safety_ceiling_percent != null && (
                    <span className={`ml-2 ${warning ? "text-error font-bold" : "text-outline"}`}>
                      ceiling {herb.safety_ceiling_percent}% · now {c.ratio}%
                    </span>
                  )}
                </p>
                {warning && (
                  <p className="text-xs text-error mt-1 leading-relaxed">
                    <strong>{warning.hazard}.</strong> {warning.clinical_manifestation}
                  </p>
                )}
                <p className="text-xs text-outline mt-1">
                  {c.ratio}% w/w · {ingredients.length > 0 ? (c.ratio / Math.max(simulation.total_ratio, 0.001) * 100).toFixed(0) : "0"}% of batch
                </p>
              </div>

              <div className="shrink-0 text-right space-y-1">
                <p className="text-xs font-mono tabular-nums text-on-surface">
                  <span title="Marginal contribution to medicine quality">Quality <b className={c.quality_delta > 0 ? "text-tiranga-green-deep" : c.quality_delta < 0 ? "text-tiranga-saffron-deep" : ""}>{signed(c.quality_delta)}</b></span>
                  {" · "}
                  <span title="Marginal contribution to Chou-Talalay CI (lower is better)">CI <b className={c.ci_delta < 0 ? "text-tiranga-green-deep" : c.ci_delta > 0 ? "text-tiranga-saffron-deep" : ""}>{signed(c.ci_delta, 2)}</b></span>
                </p>
                <p className="text-xs font-mono tabular-nums text-on-surface">
                  Patent <b className={c.patentability_delta > 0 ? "text-tiranga-green-deep" : c.patentability_delta < 0 ? "text-tiranga-saffron-deep" : ""}>{signed(c.patentability_delta)}</b>
                  {" · "}Royalty <b className={c.royalty_delta > 0 ? "text-tiranga-saffron-deep" : ""}>{signed(c.royalty_delta, 1)}%</b>
                  {" · "}Cost <b>₹{signed(c.cost_delta, 2)}</b>
                </p>
                {c.fix && (
                  <button
                    onClick={() => onApplyFix(c.fix as Directive)}
                    className="mt-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep transition-colors inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">build</span>
                    Apply fix
                  </button>
                )}
                {c.fix?.projected_impact && (
                  <p className="text-xs text-outline italic max-w-[220px]">{c.fix.projected_impact}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
