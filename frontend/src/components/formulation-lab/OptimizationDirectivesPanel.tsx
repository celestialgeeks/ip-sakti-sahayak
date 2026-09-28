"use client";

import React from "react";
import { OptimizationDirective, SimulationResult } from "@/lib/formulation/types.ts";

interface OptimizationDirectivesPanelProps {
  simulation: SimulationResult;
  onApplyDirective: (
    actionType: "add" | "increase" | "decrease" | "remove",
    herbId: string,
    targetRatio: number
  ) => void;
}

export function OptimizationDirectivesPanel({
  simulation,
  onApplyDirective,
}: OptimizationDirectivesPanelProps) {
  const { how_to_improve, what_to_remove } = simulation;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-portal-border/70 p-space-md sm:p-space-lg space-y-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-tiranga-saffron" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container pl-2">
        <div>
          <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline font-semibold">Actionable Stoichiometric Directives</span>
          <h2 className="font-title-lg text-title-lg text-portal-navy-deep font-bold tracking-tight">How to Improve &amp; What to Remove</h2>
        </div>
        <p className="text-xs text-on-surface-variant">One-click adjustments to achieve the Golden Synergy Quadrant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-2">
        {/* How to Improve */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-container flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tiranga-green" />
              How to Improve (Add / Increase)
            </span>
            <span className="text-[11px] font-label-sm text-outline">{how_to_improve.length} Directives</span>
          </div>
          <div className="space-y-2.5">
            {how_to_improve.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-secondary-container/50 bg-secondary-container/15 hover:bg-secondary-container/25 transition-colors">
                <div className="text-xs text-on-surface leading-relaxed pr-2">
                  <span className="font-semibold text-secondary mr-1.5">{item.action_type === "add" ? "＋ ADD" : "▲ BOOST"}:</span>
                  {item.text}
                </div>
                <button
                  type="button"
                  onClick={() => onApplyDirective(item.action_type, item.herb_id, item.target_ratio)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-secondary hover:bg-tiranga-green-deep text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {item.action_type === "add" ? "Add to Formula" : "Set Optimal"}
                </button>
              </div>
            ))}
            {how_to_improve.length === 0 && (
              <div className="p-4 rounded-lg bg-surface-container-low border border-portal-border/60 text-xs text-outline italic text-center">✓ No constituent additions required. Synergistic co-factors are present.</div>
            )}
          </div>
        </div>

        {/* What to Remove */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-error-container flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error" />
              What to Remove (Reduce / Drop)
            </span>
            <span className="text-[11px] font-label-sm text-outline">{what_to_remove.length} Directives</span>
          </div>
          <div className="space-y-2.5">
            {what_to_remove.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-error-container/60 bg-error-container/20 hover:bg-error-container/30 transition-colors">
                <div className="text-xs text-on-surface leading-relaxed pr-2">
                  <span className="font-semibold text-error mr-1.5">{item.action_type === "remove" ? "✕ REMOVE" : "▼ REDUCE"}:</span>
                  {item.text}
                </div>
                <button
                  type="button"
                  onClick={() => onApplyDirective(item.action_type, item.herb_id, item.target_ratio)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-error hover:bg-error/90 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {item.action_type === "remove" ? "Remove" : "Downscale"}
                </button>
              </div>
            ))}
            {what_to_remove.length === 0 && (
              <div className="p-4 rounded-lg bg-surface-container-low border border-portal-border/60 text-xs text-outline italic text-center">✓ No excessive dosages detected. All constituents are within safe therapeutic margins.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
