"use client";

import React from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface ProsAndConsPanelProps {
  simulation: SimulationResult;
}

export function ProsAndConsPanel({ simulation }: ProsAndConsPanelProps) {
  const { pros, cons } = simulation;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Statutory &amp; Pharmacological Audit
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Formulation Pros &amp; Cons
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            {pros.length} Strengths
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
            {cons.length} Vulnerabilities
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros (Strengths) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <svg
              className="w-4 h-4 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Strengths &amp; Patent Assets ({pros.length})</span>
          </div>

          <div className="space-y-2">
            {pros.map((pro, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/70 text-xs text-slate-800 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{pro}</span>
              </div>
            ))}
            {pros.length === 0 && (
              <p className="text-xs text-slate-400 italic p-3">
                No verified synergistic strengths detected yet. Add bio-enhancers or adjust ratios to establish patentability assets.
              </p>
            )}
          </div>
        </div>

        {/* Cons (Vulnerabilities) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
            <svg
              className="w-4 h-4 text-rose-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Vulnerabilities &amp; Legal Risks ({cons.length})</span>
          </div>

          <div className="space-y-2">
            {cons.map((con, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50/40 border border-rose-200/70 text-xs text-slate-800 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>{con}</span>
              </div>
            ))}
            {cons.length === 0 && (
              <p className="text-xs text-emerald-700 font-medium p-3 bg-emerald-50/30 rounded border border-emerald-200">
                ✓ No major statutory vulnerabilities detected. Formulation clears Section 3(e) and 3(p) thresholds cleanly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
