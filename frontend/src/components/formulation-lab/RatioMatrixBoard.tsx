"use client";

// Stage 2 — the bench input side (spec §5.1). Stacked 100% composition bar at
// the point of input; per-row slider + ± stepper + lock; Add-herb is the ⌘K
// drawer (no more bare <select>); sum chip · Auto-Balance · Undo travel together.

import React, { useMemo } from "react";
import { BotanicalItem, IngredientRatio } from "@/lib/formulation/types.ts";
import { IngredientSlider } from "./IngredientSlider";

interface RatioMatrixBoardProps {
  ingredients: IngredientRatio[];
  botanicals: BotanicalItem[];
  startRatios: Record<string, number>;
  onRatioChange: (herbId: string, newRatio: number) => void;
  onToggleLock: (herbId: string) => void;
  onRemoveHerb: (herbId: string) => void;
  onAutoBalance: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenHerbDrawer: () => void;
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

const CATEGORY_HUE: Record<string, string> = {
  adaptogen: "#8FA98A",
  anti_inflammatory: "#C9A66B",
  medhya: "#8DA3B9",
  bio_enhancer: "#B98A8A",
  carrier: "#D9CBA3",
  mineral_resin: "#9C8B7E",
  digestive: "#A8B5A0",
};

export function RatioMatrixBoard({
  ingredients,
  botanicals,
  startRatios,
  onRatioChange,
  onToggleLock,
  onRemoveHerb,
  onAutoBalance,
  onUndo,
  canUndo,
  onOpenHerbDrawer,
  totalRatio,
  isBalanced,
}: RatioMatrixBoardProps) {
  const botanicalsMap = useMemo(() => {
    const map = new Map<string, BotanicalItem>();
    botanicals.forEach((b) => map.set(b.id, b));
    return map;
  }, [botanicals]);

  const barTotal = Math.max(totalRatio, 0.001);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-5 relative space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-title-md text-title-md font-bold text-portal-navy-deep flex items-center gap-2">
            <span className="material-symbols-outlined text-tiranga-saffron">tune</span>
            Composition
          </h2>
          <p className="text-sm text-on-surface-variant">
            Move a slider and the rows below name what that herb just did.
          </p>
        </div>
        <button
          onClick={onOpenHerbDrawer}
          className="px-3 py-2 rounded-lg text-sm font-bold border border-portal-border bg-surface-container-lowest hover:border-tiranga-saffron hover:text-tiranga-saffron-deep transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          Add herb
          <kbd className="text-xs font-mono text-outline border border-portal-border rounded px-1">⌘K</kbd>
        </button>
      </div>

      {/* Stacked 100% composition bar — the percentage at the point of input (§5.1) */}
      {ingredients.length > 0 && (
        <div className="space-y-1">
          <div className="flex h-6 w-full rounded-lg overflow-hidden border border-portal-border/60 bg-surface-container">
            {ingredients.map((ing) => {
              const herb = botanicalsMap.get(ing.herb_id);
              const pct = (ing.ratio / barTotal) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={ing.herb_id}
                  className="h-full flex items-center justify-center overflow-hidden transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: CATEGORY_HUE[herb?.category ?? ""] ?? "#C4BBAA" }}
                  title={`${herb?.common_name ?? ing.herb_id}: ${ing.ratio.toFixed(1)}% (${pct.toFixed(1)}% of batch)`}
                >
                  {pct >= 9 && (
                    <span className="text-xs font-bold text-portal-navy-deep/90 truncate px-1">
                      {herb?.common_name.split(" (")[0] ?? ing.herb_id} {ing.ratio.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-outline">
            {ingredients.length} constituent{ingredients.length > 1 ? "s" : ""} · batch total{" "}
            <span className={isBalanced ? "font-bold text-tiranga-green-deep" : "font-bold text-tiranga-saffron-deep"}>
              {totalRatio.toFixed(1)}%
            </span>{" "}
            of 100.0% w/w
          </p>
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {ingredients.length === 0 && (
          <div className="p-6 text-center text-on-surface-variant text-sm border border-dashed border-portal-border rounded-lg">
            Nothing bound yet — press <b>Add herb</b> (⌘K) to begin.
          </div>
        )}
        {ingredients.map((ing) => {
          const herb = botanicalsMap.get(ing.herb_id);
          const start = startRatios[ing.herb_id] ?? ing.ratio;
          const delta = Math.round((ing.ratio - start) * 10) / 10;
          const overCeiling =
            herb?.safety_ceiling_percent != null && ing.ratio > herb.safety_ceiling_percent;

          return (
            <div
              key={ing.herb_id}
              className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 p-3 rounded-xl items-center border transition-all ${
                overCeiling
                  ? "border-error/50 bg-error-container/30"
                  : ing.is_locked
                  ? "border-emblem-gold/50 bg-tertiary-fixed/30"
                  : "border-portal-border/60 bg-surface-container-lowest hover:shadow-sm"
              }`}
            >
              <div className="sm:col-span-4 flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg border border-portal-border/60 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: CATEGORY_HUE[herb?.category ?? ""] ?? "#E7E0D4" }}
                >
                  <span className="material-symbols-outlined text-[19px] text-portal-navy-deep">
                    {CATEGORY_ICON[herb?.category || ""] || "eco"}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-portal-navy-deep block truncate">
                    {herb?.common_name || ing.herb_id}
                  </span>
                  <span className="text-xs italic text-outline truncate block">
                    {herb?.sanskrit_name}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-3 min-w-0">
                <p className="text-xs text-on-surface-variant truncate" title={herb?.marker_compound}>
                  {herb?.marker_compound} · {herb?.standardized_percentage}
                </p>
                <p className={`text-xs mt-0.5 ${overCeiling ? "font-bold text-error" : "text-outline"}`}>
                  {overCeiling ? "🛑 above ceiling " : "ceiling "}
                  {herb?.safety_ceiling_percent != null ? `${herb.safety_ceiling_percent}%` : "—"}
                  {delta !== 0 && (
                    <span className="ml-2 font-mono">Δ{delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} vs start</span>
                  )}
                </p>
              </div>

              <div className="sm:col-span-3">
                <IngredientSlider
                  herbId={ing.herb_id}
                  value={ing.ratio}
                  baseline={start}
                  isLocked={ing.is_locked}
                  onChange={(newRatio) => onRatioChange(ing.herb_id, newRatio)}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => onToggleLock(ing.herb_id)}
                  title={ing.is_locked ? "Unlock ratio" : "Lock ratio against Auto-Balance"}
                  className={`p-1.5 rounded-md transition-colors ${
                    ing.is_locked
                      ? "bg-emblem-gold/20 text-emblem-gold border border-emblem-gold/40"
                      : "text-outline hover:text-portal-navy-deep hover:bg-surface-container"
                  }`}
                  type="button"
                  aria-label={ing.is_locked ? `Unlock ${herb?.common_name}` : `Lock ${herb?.common_name}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{ing.is_locked ? "lock" : "lock_open"}</span>
                </button>
                <button
                  onClick={() => onRemoveHerb(ing.herb_id)}
                  title="Remove constituent"
                  className="p-1.5 rounded-md text-outline hover:text-error hover:bg-error-container/40 transition-colors"
                  type="button"
                  aria-label={`Remove ${herb?.common_name}`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* sum chip · Auto-Balance · Undo — Undo always adjacent to the sum chip (§7) */}
      <div className="pt-2 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold border ${
            isBalanced
              ? "border-tiranga-green/40 bg-secondary-container/40 text-on-secondary-container"
              : "border-tiranga-saffron/60 bg-tertiary-fixed/50 text-on-tertiary-fixed"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{isBalanced ? "balance" : "scale_unbalanced"}</span>
          {totalRatio.toFixed(1)}% / 100.0% w/w
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1 transition-colors ${
              canUndo
                ? "border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant"
                : "border border-portal-border/40 text-outline opacity-50 cursor-not-allowed"
            }`}
            type="button"
            title="Undo last Apply (one level)"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            Undo
          </button>
          <button
            onClick={onAutoBalance}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep transition-colors inline-flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
            Auto-Balance
          </button>
        </div>
      </div>
    </div>
  );
}
