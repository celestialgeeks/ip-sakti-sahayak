"use client";

import React, { useState } from "react";
import { BotanicalItem, IngredientRatio } from "@/lib/formulation/types.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/interfaces-select";

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

const CATEGORY_ICON: Record<string, string> = {
  adaptogen: "energy_savings_leaf",
  bio_enhancer: "bolt",
  anti_inflammatory: "healing",
  medhya: "psychology",
  carrier: "water_drop",
  mineral_resin: "diamond",
  digestive: "restaurant",
};

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
  const [filter, setFilter] = useState<string>("");

  const botanicalsMap = React.useMemo(() => {
    const map = new Map<string, BotanicalItem>();
    botanicals.forEach((b) => map.set(b.id, b));
    return map;
  }, [botanicals]);

  const existingHerbIds = new Set(ingredients.map((i) => i.herb_id));
  const availableBotanicals = botanicals.filter(
    (b) => !existingHerbIds.has(b.id) && b.common_name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHerbToAdd) return;
    onAddHerb(selectedHerbToAdd);
    setSelectedHerbToAdd("");
    setFilter("");
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg relative">
      {/* ── Toolbar Strip ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-md mb-space-sm border-b border-surface-container">
        <div>
          <h2 className="font-title-lg text-title-lg font-bold text-portal-navy-deep flex items-center gap-2">
            <span className="material-symbols-outlined text-tiranga-saffron">tune</span>
            Ingredients &amp; Stoichiometric Modifier Matrix
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Modify sliders to project live combinatorial effects across registries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-outline pointer-events-none">search</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-portal-surface-slate rounded text-body-sm text-on-surface placeholder:text-outline text-[12px] w-36 focus:outline-none focus:bg-surface-container-lowest"
              placeholder="Filter ingredient..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* ── Table Header ──────────────────────────────────────────────── */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-2 bg-portal-surface-subtle rounded font-label-sm text-[11px] font-bold text-outline-variant uppercase tracking-wider mb-2">
        <div className="col-span-6">Botanical / Active Compound</div>
        <div className="col-span-2 text-center">Baseline</div>
        <div className="col-span-3 text-center">What-If Ratio %</div>
        <div className="col-span-1 text-right">Lock</div>
      </div>

      {/* ── Interactive Ingredient Rows ───────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {ingredients.length === 0 && (
          <div className="p-6 text-center text-on-surface-variant font-body-sm border border-dashed border-portal-border rounded-lg">
            No constituents bound. Add a botanical below to begin.
          </div>
        )}
        {ingredients.map((ing) => {
          const herb = botanicalsMap.get(ing.herb_id);
          const baseline = baselineRatios[ing.herb_id] ?? ing.ratio;
          const delta = Math.round((ing.ratio - baseline) * 10) / 10;
          const isFocused = delta > 0;

          return (
            <div
              key={ing.herb_id}
              className={`grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-lg items-center transition-all ${
                isFocused
                  ? "bg-tertiary-fixed/30 ring-2 ring-tiranga-saffron shadow-xs"
                  : delta < 0
                  ? "bg-error-container/30"
                  : "bg-surface-container-lowest hover:bg-surface-container-low border border-portal-border/40"
              }`}
            >
              {/* Botanical info */}
              <div className="sm:col-span-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-surface-container-lowest flex items-center justify-center text-tiranga-saffron shadow-xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{CATEGORY_ICON[herb?.category || ""] || "eco"}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-title-md text-body-md font-bold text-portal-navy-deep truncate">{herb?.common_name || ing.herb_id}</span>
                    {delta !== 0 && (
                      <span className={`px-1.5 py-0.5 font-label-sm text-[10px] rounded font-bold uppercase ${delta > 0 ? "bg-tiranga-saffron/20 text-tiranga-saffron-deep" : "bg-surface-container-high text-portal-navy-deep"}`}>
                        Delta {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}%
                      </span>
                    )}
                    {herb?.is_mineral_resin && (
                      <span className="px-1.5 py-0.5 bg-tertiary-fixed/60 text-on-tertiary-fixed font-label-sm text-[10px] rounded font-bold uppercase">Mineral · NBA</span>
                    )}
                  </div>
                  <div className="text-[12px] font-body-sm italic text-on-surface-variant truncate">{herb?.botanical_name}</div>
                  <div className="text-[11px] font-label-sm text-outline mt-0.5 truncate">{herb?.marker_compound} · {herb?.standardized_percentage}</div>
                </div>
              </div>

              {/* Baseline */}
              <div className="sm:col-span-2 flex items-center justify-between sm:justify-center text-center">
                <span className="sm:hidden font-label-sm text-[12px] text-outline">Baseline:</span>
                <span className="font-label-md text-body-sm text-on-surface-variant line-through">{baseline.toFixed(1)}%</span>
              </div>

              {/* Slider & input */}
              <div className="sm:col-span-3 flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={ing.ratio}
                  disabled={ing.is_locked}
                  onChange={(e) => onRatioChange(ing.herb_id, parseFloat(e.target.value))}
                  className={`w-full accent-tiranga-saffron h-1.5 bg-surface-container rounded-lg ${ing.is_locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                />
                <div className="flex items-center justify-between text-[11px] font-label-sm">
                  <span className={delta > 0 ? "text-secondary font-semibold" : "text-outline"}>{ing.is_locked ? "Stoichiometric Constant" : delta < 0 ? "Reduced levy" : "Modifying..."}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={ing.ratio}
                      disabled={ing.is_locked}
                      onChange={(e) => onRatioChange(ing.herb_id, parseFloat(e.target.value) || 0)}
                      className="w-14 py-0.5 px-1.5 bg-surface-container-lowest font-bold text-portal-navy-deep text-right rounded border-0 text-body-sm shadow-xs"
                    />
                    <span className="font-bold text-portal-navy-deep">%</span>
                  </div>
                </div>
              </div>

              {/* Lock + remove */}
              <div className="sm:col-span-1 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => onToggleLock(ing.herb_id)}
                  title={ing.is_locked ? "Unlock Ratio" : "Lock Ratio"}
                  className={`p-1 transition-colors ${ing.is_locked ? "text-portal-navy-deep" : "text-outline hover:text-portal-navy-deep"}`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">{ing.is_locked ? "lock" : "lock_open"}</span>
                </button>
                {ingredients.length > 1 && (
                  <button
                    onClick={() => onRemoveHerb(ing.herb_id)}
                    title="Remove"
                    className="p-1 text-outline hover:text-error transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Constituent ───────────────────────────────────────────── */}
      {availableBotanicals.length > 0 && (
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2 mt-3">
          <Select value={selectedHerbToAdd} onValueChange={setSelectedHerbToAdd}>
            <SelectTrigger
              aria-label="Add botanical constituent to matrix"
              className="w-full min-w-0 flex-1 rounded border-portal-border bg-portal-surface-slate px-3 text-body-sm text-on-surface shadow-none data-[size=default]:h-[38px] data-[state=open]:border-tiranga-saffron"
            >
              <SelectValue placeholder="+ Add botanical constituent to matrix..." />
            </SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-body-sm">
              {availableBotanicals.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.common_name} ({b.botanical_name}) — {b.category.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={!selectedHerbToAdd}
            className="flex items-center gap-1 px-3 py-2 rounded bg-primary-container text-surface-container-lowest font-label-sm text-label-sm hover:bg-surface-tint transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Add Extract
          </button>
        </form>
      )}

      {/* ── Bottom Micro Controls ─────────────────────────────────────── */}
      <div className="mt-space-md pt-3 border-t border-surface-container flex flex-wrap items-center justify-between gap-3 text-body-sm">
        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-tiranga-saffron">info</span>
          <span>
            Stoichiometric sum:{" "}
            <span className={`font-bold ${isBalanced ? "text-secondary" : "text-error"}`}>{totalRatio.toFixed(1)}% / 100.0%</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onResetBaseline} className="px-3 py-1.5 rounded bg-portal-surface-slate text-portal-navy-deep font-label-sm text-label-sm hover:bg-surface-container-high transition-colors" type="button">
            Reset to Baseline Spec
          </button>
          <button onClick={onAutoBalance} className="px-3 py-1.5 rounded bg-primary-container text-surface-container-lowest font-label-sm text-label-sm hover:bg-surface-tint transition-colors" type="button">
            Auto-Balance 100%
          </button>
        </div>
      </div>
    </div>
  );
}
