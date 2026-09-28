"use client";

import React from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface QualityPatentabilityMatrixProps {
  simulation: SimulationResult;
}

export function QualityPatentabilityMatrix({
  simulation,
}: QualityPatentabilityMatrixProps) {
  const {
    medicine_quality_score,
    patentability_scope_score,
    quality_delta,
    patentability_delta,
    quality_trend,
    patentability_trend,
    quadrant,
    quadrant_label,
    quadrant_description,
    sec_3e_status,
    chou_talalay_ci,
    bioavailability_multiplier,
  } = simulation;

  const quadrantBadge = {
    GOLDEN_SYNERGY: "bg-secondary-container text-on-secondary-container",
    CLASSICAL_TRAP: "bg-tertiary-fixed/70 text-on-tertiary-fixed",
    MERE_ADMIXTURE: "bg-error-container text-on-error-container",
    NOVEL_DEFICIENT: "bg-primary-fixed text-on-primary-fixed-variant",
  }[quadrant];

  const quadrantDot = {
    GOLDEN_SYNERGY: "bg-tiranga-green",
    CLASSICAL_TRAP: "bg-emblem-gold",
    MERE_ADMIXTURE: "bg-error",
    NOVEL_DEFICIENT: "bg-primary-container",
  }[quadrant];

  const trendChip = (trend: string, delta: number) =>
    trend === "SURGE"
      ? "bg-secondary-container/60 text-on-secondary-container"
      : trend === "DECLINE"
      ? "bg-error-container/60 text-on-error-container"
      : "bg-surface-container text-on-surface-variant";

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-portal-border/70 p-space-md sm:p-space-lg space-y-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tiranga-saffron via-surface-container-lowest to-tiranga-green opacity-90" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline font-semibold">
              Pharmacodynamics vs. Statutory Clearance
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs font-semibold text-primary">Patents Act 1970 §3(e) &amp; §3(p)</span>
          </div>
          <h2 className="font-title-lg text-title-lg text-portal-navy-deep font-bold tracking-tight">
            Medicine Quality &amp; Patentability Correlation
          </h2>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-label-sm font-label-sm font-bold ${quadrantBadge}`}>
          <span className={`w-2 h-2 rounded-full ${quadrantDot}`} />
          {quadrant_label}
        </span>
      </div>

      {/* ── Dual Dimension Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-portal-border/50 bg-surface-container-low/70 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline">Medicine Quality &amp; Efficacy</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg font-bold text-portal-navy-deep">{medicine_quality_score}</span>
                <span className="text-xs text-outline font-mono">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono ${trendChip(quality_trend, quality_delta)}`}>
                {quality_delta >= 0 ? `▲ +${quality_delta}%` : `▼ ${quality_delta}%`}
              </span>
              <span className="text-[10px] text-outline block mt-0.5">vs. Generic Admixture</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${medicine_quality_score >= 80 ? "bg-tiranga-green" : medicine_quality_score >= 65 ? "bg-primary-container" : "bg-emblem-gold"}`} style={{ width: `${medicine_quality_score}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container text-xs">
            <div>
              <span className="text-outline text-[11px] block">Bioavailability</span>
              <span className="font-semibold text-portal-navy-deep font-mono">{bioavailability_multiplier}x Absorption</span>
            </div>
            <div>
              <span className="text-outline text-[11px] block">Dosage Safe Window</span>
              <span className="font-semibold text-secondary">
                {simulation.patient_safety_warnings.length === 0 ? "100% Compliant" : `${simulation.patient_safety_warnings.length} Hazard Advisory`}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-portal-border/50 bg-surface-container-low/70 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline">Patentability Scope &amp; Novelty</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg font-bold text-portal-navy-deep">{patentability_scope_score}</span>
                <span className="text-xs text-outline font-mono">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono ${trendChip(patentability_trend, patentability_delta)}`}>
                {patentability_delta >= 0 ? `▲ +${patentability_delta}%` : `▼ ${patentability_delta}%`}
              </span>
              <span className="text-[10px] text-outline block mt-0.5">Section 3(e) Clearance</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${patentability_scope_score >= 75 ? "bg-tiranga-green" : patentability_scope_score >= 50 ? "bg-emblem-gold" : "bg-error"}`} style={{ width: `${patentability_scope_score}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container text-xs">
            <div>
              <span className="text-outline text-[11px] block">Chou-Talalay CI</span>
              <span className={`font-semibold font-mono ${sec_3e_status === "CLEARED" ? "text-secondary" : "text-error"}`}>
                CI: {chou_talalay_ci} {chou_talalay_ci < 0.75 ? "(Super-Additive)" : "(Additive)"}
              </span>
            </div>
            <div>
              <span className="text-outline text-[11px] block">Section 3(e) Status</span>
              <span className={`font-semibold ${sec_3e_status === "CLEARED" ? "text-secondary" : sec_3e_status === "BORDERLINE" ? "text-emblem-gold" : "text-error"}`}>
                {sec_3e_status === "CLEARED" ? "Cleared for Grant" : sec_3e_status === "BORDERLINE" ? "Near-Additive Risk" : "Mere Admixture Bar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Strategic Diagnosis ──────────────────────────────────────── */}
      <div className="rounded-xl border border-portal-border/50 bg-surface-container-low/70 p-4">
        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          <strong className="text-portal-navy-deep font-semibold">Strategic Diagnosis:</strong> {quadrant_description}
        </p>
      </div>
    </div>
  );
}
