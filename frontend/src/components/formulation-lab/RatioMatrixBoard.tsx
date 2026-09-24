"use client";

import React, { useState } from "react";
import { BotanicalItem, IngredientRatio } from "@/lib/formulation/types.ts";

interface RatioMatrixBoardProps {
  ingredients: IngredientRatio[];
  botanicals: BotanicalItem[];
  baselineRatios: Record<string, number>;
  onRatioChange: (herbId: string, newRatio: number) => void;
  onToggleLock: (herbId: string) => void;
  onRemoveHerb: (herbId: string) => void;
  onAddHerb: (herbId: string) => void;
  onAutoBalance: () => void;
  onResetBaseline: () => void;
  totalRatio: number;
  isBalanced: boolean;
}

export function RatioMatrixBoard({
  ingredients,
  botanicals,
  baselineRatios,
  onRatioChange,
  onToggleLock,
  onRemoveHerb,
  onAddHerb,
  onAutoBalance,
  onResetBaseline,
  totalRatio,
  isBalanced,
}: RatioMatrixBoardProps) {
  const [selectedHerbToAdd, setSelectedHerbToAdd] = useState<string>("");

  const botanicalsMap = React.useMemo(() => {
    const map = new Map<string, BotanicalItem>();
    botanicals.forEach((b) => map.set(b.id, b));
    return map;
  }, [botanicals]);

  const existingHerbIds = new Set(ingredients.map((i) => i.herb_id));
  const availableBotanicals = botanicals.filter((b) => !existingHerbIds.has(b.id));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHerbToAdd) return;
    onAddHerb(selectedHerbToAdd);
    setSelectedHerbToAdd("");
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      {/* ── Table Header & Action Controls ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Stoichiometric Ratio Modifier</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              The "What-If" Matrix
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modulate active constituents to evaluate synergism, bioavailability, and benefit-sharing liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onResetBaseline}
            className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Reset Baseline
          </button>
          <button
            onClick={onAutoBalance}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              isBalanced
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                : "bg-[#00263f] hover:bg-[#083b5c] text-white"
            }`}
          >
            {isBalanced ? "✓ Balanced (100.0%)" : "Auto-Balance to 100%"}
          </button>
        </div>
      </div>

      {/* ── Botanical Selector Dropdown ────────────────────────────────── */}
      {availableBotanicals.length > 0 && (
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <select
            value={selectedHerbToAdd}
            onChange={(e) => setSelectedHerbToAdd(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00263f]"
          >
            <option value="">+ Add botanical constituent to matrix...</option>
            {availableBotanicals.map((b) => (
              <option key={b.id} value={b.id}>
                {b.common_name} ({b.botanical_name}) — {b.category.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedHerbToAdd}
            className="px-4 py-2 rounded bg-[#00263f] hover:bg-[#083b5c] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add Constituent
          </button>
        </form>
      )}

      {/* ── High-Contrast Stoichiometric Rows ─────────────────────────── */}
      <div className="space-y-3">
        {ingredients.map((ing) => {
          const herb = botanicalsMap.get(ing.herb_id);
          const baseline = baselineRatios[ing.herb_id] ?? ing.ratio;
          const delta = Math.round((ing.ratio - baseline) * 10) / 10;

          return (
            <div
              key={ing.herb_id}
              className={`p-4 rounded-lg border transition-all ${
                delta > 0
                  ? "bg-slate-50/60 border-slate-300"
                  : delta < 0
                  ? "bg-rose-50/30 border-rose-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-slate-900">
                    {herb?.common_name || ing.herb_id}
                  </span>
                  <span className="text-[11px] italic text-slate-500">
                    ({herb?.botanical_name})
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {herb?.marker_compound}
                  </span>
                  {herb?.is_mineral_resin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                      Mineral Resin · NBA Scrutiny
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {delta !== 0 && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        delta > 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                    </span>
                  )}

                  <button
                    onClick={() => onToggleLock(ing.herb_id)}
                    title={ing.is_locked ? "Ratio Locked" : "Lock Ratio"}
                    className={`px-2 py-1 rounded border text-xs font-mono transition-colors ${
                      ing.is_locked
                        ? "bg-slate-100 text-slate-800 border-slate-300 font-bold"
                        : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
                    }`}
                  >
                    {ing.is_locked ? "🔒 Locked" : "🔓 Lock"}
                  </button>

                  {ingredients.length > 1 && (
                    <button
                      onClick={() => onRemoveHerb(ing.herb_id)}
                      title="Remove"
                      className="px-2 py-1 rounded border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Slider & Controls */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRatioChange(ing.herb_id, Math.max(0, ing.ratio - 5))}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => onRatioChange(ing.herb_id, Math.max(0, ing.ratio - 1))}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    -1%
                  </button>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={ing.ratio}
                  onChange={(e) => onRatioChange(ing.herb_id, parseFloat(e.target.value))}
                  className="flex-1 accent-[#00263f] cursor-pointer h-1.5 bg-slate-200 rounded appearance-none"
                />

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRatioChange(ing.herb_id, Math.min(100, ing.ratio + 1))}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    +1%
                  </button>
                  <button
                    onClick={() => onRatioChange(ing.herb_id, Math.min(100, ing.ratio + 5))}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    +5%
                  </button>
                </div>

                <div className="flex items-center gap-1 w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={ing.ratio}
                    onChange={(e) => onRatioChange(ing.herb_id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold text-right rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00263f]"
                  />
                  <span className="text-xs font-mono text-slate-400">%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stoichiometric Balance Progress Bar ────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="space-y-1">
          <span className="text-slate-500 block font-medium">
            Stoichiometric Sum:
          </span>
          <div className="w-48 h-2 rounded bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all ${
                isBalanced ? "bg-emerald-600" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, totalRatio)}%` }}
            />
          </div>
        </div>

        <div className="text-right">
          <span
            className={`font-mono font-bold text-sm ${
              isBalanced ? "text-emerald-700" : "text-amber-800"
            }`}
          >
            {totalRatio.toFixed(1)}% / 100.0%
          </span>
          {!isBalanced && (
            <span className="text-[11px] text-amber-700 block mt-0.5">
              Adjustment required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
