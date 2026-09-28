"use client";

import React from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface ProsAndConsPanelProps {
  simulation: SimulationResult;
}

export function ProsAndConsPanel({ simulation }: ProsAndConsPanelProps) {
  const { pros, cons } = simulation;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-portal-border/70 p-space-md sm:p-space-lg space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div>
          <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline font-semibold">Statutory &amp; Pharmacological Audit</span>
          <h2 className="font-title-lg text-title-lg text-portal-navy-deep font-bold tracking-tight">Formulation Pros &amp; Cons</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container border border-secondary-container">{pros.length} Strengths</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-error-container/60 text-on-error-container border border-error-container">{cons.length} Vulnerabilities</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
            <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
            <span>Strengths &amp; Patent Assets ({pros.length})</span>
          </div>
          <div className="space-y-2">
            {pros.map((pro, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary-container/20 border border-secondary-container/50 text-xs text-on-surface leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-tiranga-green mt-1.5 shrink-0" />
                <span>{pro}</span>
              </div>
            ))}
            {pros.length === 0 && (
              <p className="text-xs text-outline italic p-3">No verified synergistic strengths detected yet. Add bio-enhancers or adjust ratios to establish patentability assets.</p>
            )}
          </div>
        </div>

        {/* Cons */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-error-container">
            <span className="material-symbols-outlined text-[18px] text-error">error</span>
            <span>Vulnerabilities &amp; Legal Risks ({cons.length})</span>
          </div>
          <div className="space-y-2">
            {cons.map((con, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-error-container/30 border border-error-container/60 text-xs text-on-surface leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0" />
                <span>{con}</span>
              </div>
            ))}
            {cons.length === 0 && (
              <p className="text-xs text-on-secondary-container font-medium p-3 bg-secondary-container/20 rounded-lg border border-secondary-container/50">✓ No major statutory vulnerabilities detected. Formulation clears Section 3(e) and 3(p) thresholds cleanly.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
