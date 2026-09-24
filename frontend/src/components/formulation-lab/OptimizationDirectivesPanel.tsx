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
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Actionable Stoichiometric Directives
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            How to Improve &amp; What to Remove
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          One-click adjustments to achieve the Golden Synergy Quadrant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* How to Improve (Add / Increase) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              How to Improve (Add / Increase)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {how_to_improve.length} Directives
            </span>
          </div>

          <div className="space-y-2.5">
            {how_to_improve.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors"
              >
                <div className="text-xs text-slate-800 leading-relaxed pr-2">
                  <span className="font-semibold text-emerald-900 mr-1.5">
                    {item.action_type === "add" ? "＋ ADD" : "▲ BOOST"}:
                  </span>
                  {item.text}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onApplyDirective(item.action_type, item.herb_id, item.target_ratio)
                  }
                  className="shrink-0 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {item.action_type === "add" ? "Add to Formula" : "Set Optimal"}
                </button>
              </div>
            ))}

            {how_to_improve.length === 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
                ✓ No constituent additions required. Synergistic co-factors are present.
              </div>
            )}
          </div>
        </div>

        {/* What to Remove (Reduce / Drop) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              What to Remove (Reduce / Drop)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {what_to_remove.length} Directives
            </span>
          </div>

          <div className="space-y-2.5">
            {what_to_remove.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition-colors"
              >
                <div className="text-xs text-slate-800 leading-relaxed pr-2">
                  <span className="font-semibold text-rose-900 mr-1.5">
                    {item.action_type === "remove" ? "✕ REMOVE" : "▼ REDUCE"}:
                  </span>
                  {item.text}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onApplyDirective(item.action_type, item.herb_id, item.target_ratio)
                  }
                  className="shrink-0 px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {item.action_type === "remove" ? "Remove" : "Downscale"}
                </button>
              </div>
            ))}

            {what_to_remove.length === 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
                ✓ No excessive dosages detected. All constituents are within safe therapeutic margins.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
