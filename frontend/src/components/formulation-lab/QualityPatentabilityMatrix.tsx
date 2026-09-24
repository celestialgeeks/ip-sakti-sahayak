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

  // Normalized 0-100 coordinates for the 2D Quadrant Map
  const posX = Math.max(5, Math.min(95, patentability_scope_score));
  const posY = Math.max(5, Math.min(95, 100 - medicine_quality_score)); // Invert Y for SVG coordinates (top is 100)

  const quadrantBadgeStyles = {
    GOLDEN_SYNERGY: "bg-emerald-50 text-emerald-800 border-emerald-300",
    CLASSICAL_TRAP: "bg-amber-50 text-amber-800 border-amber-300",
    MERE_ADMIXTURE: "bg-rose-50 text-rose-800 border-rose-300",
    NOVEL_DEFICIENT: "bg-purple-50 text-purple-800 border-purple-300",
  }[quadrant];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      {/* ── Header: Title & Quadrant Tag ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Pharmacodynamics vs. Statutory Clearance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#00263f]">
              Patents Act 1970 §3(e) &amp; §3(p)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Medicine Quality &amp; Patentability Correlation
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border ${quadrantBadgeStyles}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                quadrant === "GOLDEN_SYNERGY"
                  ? "bg-emerald-500"
                  : quadrant === "CLASSICAL_TRAP"
                  ? "bg-amber-500"
                  : quadrant === "MERE_ADMIXTURE"
                  ? "bg-rose-500"
                  : "bg-purple-500"
              }`}
            />
            {quadrant_label}
          </span>
        </div>
      </div>

      {/* ── Dual Dimension High-Impact Cards (Quality vs Patentability) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Medicine Quality & Efficacy */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Medicine Quality &amp; Efficacy
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {medicine_quality_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                  quality_trend === "SURGE"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : quality_trend === "DECLINE"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {quality_delta >= 0 ? `▲ +${quality_delta}%` : `▼ ${quality_delta}%`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                vs. Generic Admixture
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                medicine_quality_score >= 80
                  ? "bg-emerald-600"
                  : medicine_quality_score >= 65
                  ? "bg-blue-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${medicine_quality_score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Bioavailability</span>
              <span className="font-semibold text-slate-800 font-mono">
                {bioavailability_multiplier}x Absorption
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Dosage Safe Window</span>
              <span className="font-semibold text-emerald-700">
                {simulation.patient_safety_warnings.length === 0
                  ? "100% Compliant"
                  : `${simulation.patient_safety_warnings.length} Hazard Advisory`}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Patentability Scope & Novelty Index */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Patentability Scope &amp; Novelty
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {patentability_scope_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                  patentability_trend === "SURGE"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : patentability_trend === "DECLINE"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {patentability_delta >= 0
                  ? `▲ +${patentability_delta}%`
                  : `▼ ${patentability_delta}%`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Section 3(e) Clearance
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                patentability_scope_score >= 75
                  ? "bg-emerald-600"
                  : patentability_scope_score >= 50
                  ? "bg-amber-500"
                  : "bg-rose-600"
              }`}
              style={{ width: `${patentability_scope_score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Chou-Talalay CI</span>
              <span
                className={`font-semibold font-mono ${
                  sec_3e_status === "CLEARED" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                CI: {chou_talalay_ci}{" "}
                {chou_talalay_ci < 0.75 ? "(Super-Additive)" : "(Additive)"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Section 3(e) Status</span>
              <span
                className={`font-semibold ${
                  sec_3e_status === "CLEARED"
                    ? "text-emerald-700"
                    : sec_3e_status === "BORDERLINE"
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {sec_3e_status === "CLEARED"
                  ? "Cleared for Grant"
                  : sec_3e_status === "BORDERLINE"
                  ? "Near-Additive Risk"
                  : "Mere Admixture Bar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2D Strategic Correlation Map (SVG) ─────────────────────────── */}
      <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Strategic Correlation Map (Quality vs. Patentability Plane)
          </span>
          <span className="text-[11px] text-slate-500">
            Coordinates: Quality ({medicine_quality_score}) · Patentability ({patentability_scope_score})
          </span>
        </div>

        <div className="relative w-full h-56 bg-slate-50 rounded border border-slate-200 overflow-hidden select-none">
          {/* Quadrant Background Zones */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 text-[10px] font-mono">
            {/* Top-Left: Classical Trap */}
            <div className="p-2 border-r border-b border-dashed border-slate-300 bg-amber-50/40 text-amber-800 flex flex-col justify-start items-start">
              <span className="font-bold">CLASSICAL PRIOR ART TRAP</span>
              <span className="text-[9px] text-amber-700/80">High Efficacy · §3(p) Blocked</span>
            </div>

            {/* Top-Right: Golden Synergy */}
            <div className="p-2 border-b border-dashed border-slate-300 bg-emerald-50/40 text-emerald-800 flex flex-col justify-start items-end text-right">
              <span className="font-bold">GOLDEN SYNERGY QUADRANT</span>
              <span className="text-[9px] text-emerald-700/80">High Quality · Overcomes §3(e)</span>
            </div>

            {/* Bottom-Left: Mere Admixture */}
            <div className="p-2 border-r border-dashed border-slate-300 bg-rose-50/40 text-rose-800 flex flex-col justify-end items-start">
              <span className="font-bold">MERE ADMIXTURE BAR</span>
              <span className="text-[9px] text-rose-700/80">Sub-Optimal · Fatal §3(e)</span>
            </div>

            {/* Bottom-Right: Novel Deficient */}
            <div className="p-2 bg-purple-50/40 text-purple-800 flex flex-col justify-end items-end text-right">
              <span className="font-bold">NOVEL DEFICIENT</span>
              <span className="text-[9px] text-purple-700/80">Artificially Novel · Low Efficacy</span>
            </div>
          </div>

          {/* Target Center Threshold Crosshairs */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300" />

          {/* Current Formulation Coordinate Pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 flex flex-col items-center"
            style={{ left: `${posX}%`, top: `${posY}%` }}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-blue-500/20 animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#00263f] border-2 border-white shadow-md" />
            </div>
            <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-sm">
              Your Formula ({medicine_quality_score}, {patentability_scope_score})
            </span>
          </div>
        </div>

        {/* Dynamic Interpretation text */}
        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          <strong className="text-slate-900 font-semibold">Strategic Diagnosis:</strong>{" "}
          {quadrant_description}
        </p>
      </div>
    </div>
  );
}
