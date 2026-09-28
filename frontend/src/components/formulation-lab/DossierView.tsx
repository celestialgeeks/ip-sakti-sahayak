"use client";

// Stage 6 — Export dossier (spec §13). Gated on zero FATAL objections; every
// failing gate links back to its remedy. Contents: formulation table, Pre-FER
// report, safety panel, quadrant trajectory, applied-directives log,
// ABS/Form I-III status, citations. Identical under every lens (§11.1 hard rule).
// PDF: browser print of this view only (open decision #1 — weasyprint left for
// a follow-up; a print stylesheet isolates the dossier from the app shell).

import React, { useMemo } from "react";
import { BotanicalItem, IngredientRatio, PreFERReport, SimulationResult } from "@/lib/formulation/types";
import { LENS_ORDER, Lens } from "@/lib/formulation/gates";

export interface TrajectoryPoint {
  quality: number;
  patentability: number;
  label: string;
}

interface DossierViewProps {
  simulation: SimulationResult;
  ingredients: IngredientRatio[];
  herbs: BotanicalItem[];
  preFerReport: PreFERReport | null;
  fatalCount: number;
  gates: { id: string; label: string; passed: boolean; remedyHint?: string }[];
  trajectory: TrajectoryPoint[];
  appliedLog: string[];
  staleAfterExport: boolean;
  exportedOnce: boolean;
  lens: Lens;
  onJumpToRemedy: (gateId: string) => void;
  onBackToBench: () => void;
  onExported: () => void;
}

export function DossierView({
  simulation,
  ingredients,
  herbs,
  preFerReport,
  fatalCount,
  gates,
  trajectory,
  appliedLog,
  staleAfterExport,
  exportedOnce,
  lens,
  onJumpToRemedy,
  onBackToBench,
  onExported,
}: DossierViewProps) {
  const herbById = new Map(herbs.map((h) => [h.id, h]));
  const exportAllowed = fatalCount === 0 && gates.every((g) => g.passed) && !staleAfterExport && preFerReport !== null;

  const jsonPayload = useMemo(
    () => ({
      title: simulation.title,
      generated: new Date().toISOString(),
      note: "Simulated pre-filing rehearsal. No application number exists — nothing here is a filed legal artifact.",
      entity_type: simulation.entity_type ?? "domestic",
      statutory: {
        chou_talalay_ci: simulation.chou_talalay_ci,
        sec_3e_status: simulation.sec_3e_status,
        tkdl_concordance_score: simulation.tkdl_concordance_score,
        tkdl_shloka_match: simulation.tkdl_shloka_match,
        nba_abs_royalty_percentage: simulation.nba_abs_royalty_percentage,
        nba_form_tier: simulation.nba_form_tier,
        tier: simulation.tier,
        medicine_quality_score: simulation.medicine_quality_score,
        patentability_scope_score: simulation.patentability_scope_score,
      },
      composition: ingredients.map((i) => ({
        herb_id: i.herb_id,
        common_name: herbById.get(i.herb_id)?.common_name ?? i.herb_id,
        botanical_name: herbById.get(i.herb_id)?.botanical_name,
        marker: herbById.get(i.herb_id)?.marker_compound,
        ratio: i.ratio,
      })),
      contributions: simulation.contributions ?? [],
      patient_safety_warnings: simulation.patient_safety_warnings,
      pre_fer: preFerReport,
      applied_directives: appliedLog,
      trajectory: trajectory.map((t) => ({ quality: t.quality, patentability: t.patentability, action: t.label })),
      cost_waterfall: simulation.cost_waterfall,
      cost_per_unit: simulation.cost_per_unit,
      citations: [
        "The Patents Act, 1970, §3(e) — mere admixture (corpus: india_ip_law)",
        "The Patents Act, 1970, §3(p) — traditional knowledge (corpus: india_tkdl · TKDL Charaka Samhita concordance)",
        "Biological Diversity Act, 2002 (amended 2023) §6 & NBA Rule 13 — Form III / Form I access and benefit-sharing",
        "WIPO GRATK Treaty 2024 — traditional knowledge disclosure in patent applications",
        "Ayurvedic Pharmacopoeia of India Part-I — herb dose ceilings",
      ],
    }),
    [simulation, ingredients, preFerReport, appliedLog, trajectory, herbById]
  );

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IPSAKTI_Dossier_${(simulation.title || "formulation").replace(/[^a-z0-9]+/gi, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExported();
  };

  const printDossier = () => {
    onExported();
    window.print();
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 print:max-w-none print:space-y-2" id="dossier-root">
      {/* Export gate */}
      <div className={`rounded-xl border p-4 print:hidden ${exportAllowed ? "border-tiranga-green/50 bg-secondary-container/30" : "border-error/40 bg-error-container/40"}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[22px] ${exportAllowed ? "text-tiranga-green-deep" : "text-error"}`}>
            {exportAllowed ? "lock_open" : "lock"}
          </span>
          <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep">
            {exportAllowed
              ? "Dossier unlocked — zero fatal objections"
              : staleAfterExport && exportedOnce
              ? "Dossier STALE — composition changed after export; re-check needed"
              : `Export locked — ${gates.filter((g) => !g.passed).length} unmet gate(s)`}
          </h3>
        </div>
        <ul className="mt-3 space-y-1.5">
          {gates.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[17px] ${g.passed ? "text-tiranga-green-deep" : "text-error"}`}>
                  {g.passed ? "check_circle" : "cancel"}
                </span>
                <span className={g.passed ? "text-on-surface-variant" : "text-on-surface font-semibold"}>{g.label}</span>
              </span>
              {!g.passed && (
                <button onClick={() => onJumpToRemedy(g.id)} className="text-xs font-bold text-primary hover:underline shrink-0">
                  Apply remedy →
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-outline mt-2">
          Lens is for reading order only — this dossier is byte-identical under {LENS_ORDER[lens].length} panel orderings: every fact appears regardless of Medicine / Law / Money choice.
        </p>
      </div>

      {/* Document */}
      <div className="rounded-xl border border-portal-border bg-surface-container-lowest overflow-hidden print:border-0">
        <div className="h-1 bg-gradient-to-r from-tiranga-saffron via-white to-tiranga-green" />
        <div className="p-6 border-b border-portal-border/60 text-center space-y-1">
          <h2 className="font-title-lg text-title-lg font-bold text-portal-navy-deep">IP-SAKTI Formulation Dossier</h2>
          <p className="text-sm text-on-surface-variant">Government of India · Ministry of Ayush — ASU Drug &amp; Patent Submission Rehearsal</p>
          <p className="text-xs font-mono text-outline">
            Ref: CLIENT-WORKING-COPY · {new Date().toLocaleDateString("en-IN")} · NOT A FILED DOCUMENT — no application number exists
          </p>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">1 · Composition</h4>
            <table className="w-full text-left border border-portal-border/60 border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-portal-surface-subtle text-xs text-outline uppercase">
                  <th className="p-2">Botanical</th>
                  <th className="p-2">Latin binomial</th>
                  <th className="p-2">Marker</th>
                  <th className="p-2 text-right">% w/w</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((i) => {
                  const h = herbById.get(i.herb_id);
                  return (
                    <tr key={i.herb_id} className="border-t border-portal-border/40">
                      <td className="p-2 font-semibold text-portal-navy-deep">{h?.common_name ?? i.herb_id}</td>
                      <td className="p-2 italic text-on-surface-variant">{h?.botanical_name ?? "—"}</td>
                      <td className="p-2 font-mono text-xs">{h?.marker_compound ?? "—"}</td>
                      <td className="p-2 text-right font-mono">{i.ratio.toFixed(1)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-portal-navy-deep/30 font-bold">
                  <td colSpan={3} className="p-2">Total</td>
                  <td className={`p-2 text-right font-mono ${simulation.is_balanced ? "text-tiranga-green-deep" : "text-tiranga-saffron-deep"}`}>
                    {simulation.total_ratio.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">2 · Statutory position</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { k: "Medicine quality", v: `${simulation.medicine_quality_score}/99` },
                { k: "Chou-Talalay CI", v: `${simulation.chou_talalay_ci} · §3(e) ${simulation.sec_3e_status}` },
                { k: "TKDL concordance", v: `${simulation.tkdl_concordance_score} · ${simulation.tkdl_shloka_match}` },
                { k: "NBA benefit-share", v: `${simulation.nba_abs_royalty_percentage}% · ${simulation.nba_form_tier}` },
                { k: "Entity type", v: simulation.entity_type ?? "domestic" },
                { k: "Cost / unit", v: `₹${(simulation.cost_per_unit ?? 0).toFixed(2)}` },
                { k: "Tier", v: simulation.tier_sanskrit },
                { k: "Safety rating", v: simulation.overall_safety_rating },
              ].map((row) => (
                <div key={row.k} className="rounded-lg border border-portal-border/60 p-2.5">
                  <p className="text-xs text-outline">{row.k}</p>
                  <p className="text-sm font-bold text-portal-navy-deep">{row.v}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">3 · Patient safety disclosure</h4>
            {simulation.patient_safety_warnings.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No constituent exceeds its documented ceiling at current ratios.</p>
            ) : (
              <ul className="space-y-1.5">
                {simulation.patient_safety_warnings.map((w, i) => (
                  <li key={i} className={`rounded-lg border p-2.5 text-sm ${w.severity === "CRITICAL" ? "border-error/50 bg-error-container/40" : "border-emblem-gold/40 bg-tertiary-fixed/30"}`}>
                    <b>{w.severity === "CRITICAL" ? "🛑" : "⚠"} {w.herb_name}</b> at {w.current_dose_percent}% — {w.hazard}. <span className="text-on-surface-variant">{w.safe_limit}.</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {preFerReport && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">4 · Pre-FER examination ({preFerReport.overall_patentability_score}/100)</h4>
              <ul className="space-y-1.5">
                {preFerReport.objections.map((o, i) => (
                  <li key={i} className="rounded-lg border border-portal-border/60 p-2.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${
                      o.severity === "FATAL"
                        ? "bg-error-container text-on-error-container"
                        : o.severity === "OVERCOME"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-tertiary-fixed text-on-tertiary-fixed"
                    }`}>{o.severity}</span>
                    <b className="text-portal-navy-deep">{o.section}</b> — {o.finding}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trajectory.length > 0 && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">5 · Optimization trajectory (Apply-fix history)</h4>
              <div className="flex items-end gap-1 h-16 border border-portal-border/60 rounded-lg p-2 bg-portal-surface-subtle">
                {trajectory.slice(-20).map((t, i) => (
                  <div key={i} title={`${t.label}: Q${t.quality} / P${t.patentability}`} className="flex-1 flex flex-col justify-end gap-1">
                    <span className="bg-tiranga-green-deep/80 rounded-t-sm" style={{ height: `${(t.quality / 99) * 36}px` }} />
                    <span className="bg-primary rounded-b-sm" style={{ height: `${(t.patentability / 98) * 18}px` }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">6 · Applied directives log</h4>
            {appliedLog.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No fixes applied yet — this dossier reflects the starting preset.</p>
            ) : (
              <ol className="list-decimal pl-5 space-y-1 text-sm text-on-surface-variant">
                {appliedLog.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">7 · Citations</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-on-surface-variant">
              {(jsonPayload.citations as string[]).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <button
          onClick={onBackToBench}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Back to Bench
        </button>
        <div className="flex gap-2">
          <button
            disabled={!exportAllowed}
            onClick={printDossier}
            className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${
              exportAllowed
                ? "border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant"
                : "border border-portal-border/40 bg-surface-container text-outline cursor-not-allowed opacity-60"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            Print / Save PDF
          </button>
          <button
            disabled={!exportAllowed}
            onClick={downloadJSON}
            className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${
              exportAllowed
                ? "bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep"
                : "bg-surface-container text-outline cursor-not-allowed opacity-60"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            Download full package (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
