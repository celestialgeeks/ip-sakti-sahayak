"use client";

import React, { useRef, useState } from "react";
import { Minus, Plus, Lock } from "lucide-react";

interface IngredientSliderProps {
  herbId: string;
  value: number; // Ratio % (0 to 100)
  baseline: number; // Baseline reference %
  disabled?: boolean;
  isLocked?: boolean;
  onChange: (newValue: number) => void;
  className?: string;
}

export const IngredientSlider: React.FC<IngredientSliderProps> = ({
  herbId,
  value,
  baseline,
  disabled = false,
  isLocked = false,
  onChange,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const clampedValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const clampedBaseline = Math.min(100, Math.max(0, Number.isFinite(baseline) ? baseline : 0));
  const delta = Math.round((clampedValue - clampedBaseline) * 10) / 10;

  const handleStep = (stepDelta: number) => {
    if (isLocked || disabled) return;
    const next = Math.round(Math.min(100, Math.max(0, clampedValue + stepDelta)) * 10) / 10;
    onChange(next);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked || disabled) return;
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(Math.min(100, Math.max(0, parsed)));
    } else {
      onChange(0);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* ── Main Interactive Slider Track ── */}
      <div
        className="relative flex items-center w-full group py-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track Container */}
        <div
          ref={trackRef}
          className="relative h-2.5 w-full rounded-full bg-slate-100 border border-slate-200/90 shadow-2xs overflow-hidden"
        >
          {/* Active Fill Gradient */}
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isLocked
                ? "bg-slate-300"
                : delta > 0
                ? "bg-gradient-to-r from-amber-400 via-tiranga-saffron to-tiranga-saffron-deep"
                : delta < 0
                ? "bg-gradient-to-r from-slate-300 to-amber-500"
                : "bg-gradient-to-r from-amber-400 to-tiranga-saffron"
            }`}
            style={{ width: `${clampedValue}%` }}
          />

          {/* Baseline Reference Marker on Track */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 z-10 pointer-events-none"
            style={{ left: `${clampedBaseline}%` }}
            title={`Baseline: ${clampedBaseline.toFixed(1)}%`}
          />
        </div>

        {/* Custom Tactile Thumb Knob */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-75 flex items-center justify-center rounded-full shadow-sm ${
            isLocked
              ? "h-4 w-4 bg-slate-200 border-2 border-slate-400 text-slate-500"
              : isHovered || isFocused
              ? "h-5 w-5 bg-white border-2 border-tiranga-saffron-deep ring-4 ring-tiranga-saffron/20 scale-110 shadow-md"
              : "h-4.5 w-4.5 bg-white border-2 border-tiranga-saffron shadow-xs"
          }`}
          style={{ left: `${clampedValue}%` }}
        >
          {isLocked ? (
            <Lock className="h-2 w-2" />
          ) : (
            <div
              className={`rounded-full transition-all ${
                isHovered
                  ? "h-2 w-2 bg-tiranga-saffron-deep"
                  : "h-1.5 w-1.5 bg-tiranga-saffron"
              }`}
            />
          )}
        </div>

        {/* Accessible Range Input Overlay */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={clampedValue}
          disabled={isLocked || disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={`Ratio for ingredient ${herbId}`}
          className={`absolute inset-0 w-full h-full opacity-0 z-20 ${
            isLocked || disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        />
      </div>

      {/* ── Sub-row: Stepper Nudge Controls, Status & Direct Input ── */}
      <div className="flex items-center justify-between text-[11px] font-label-sm gap-2">
        {/* Left: Quick Micro Stepper Buttons & Status Text */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center border border-slate-200 rounded bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              disabled={isLocked || disabled || clampedValue <= 0}
              onClick={() => handleStep(-0.5)}
              title="Decrease ratio by 0.5%"
              className="p-0.5 px-1 text-slate-500 hover:text-portal-navy-deep hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="w-[1px] h-3 bg-slate-200" />
            <button
              type="button"
              disabled={isLocked || disabled || clampedValue >= 100}
              onClick={() => handleStep(0.5)}
              title="Increase ratio by 0.5%"
              className="p-0.5 px-1 text-slate-500 hover:text-portal-navy-deep hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span
            className={`truncate text-[11px] ${
              isLocked
                ? "text-slate-500 font-medium"
                : delta > 0
                ? "text-secondary font-semibold"
                : delta < 0
                ? "text-amber-700 font-medium"
                : "text-outline"
            }`}
          >
            {isLocked
              ? "Stoichiometric Constant"
              : delta > 0
              ? `+${delta.toFixed(1)}% elevated`
              : delta < 0
              ? `${delta.toFixed(1)}% reduced`
              : "Baseline spec"}
          </span>
        </div>

        {/* Right: Direct High-Precision Numeric Pill */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={clampedValue}
              disabled={isLocked || disabled}
              onChange={handleNumberChange}
              className="w-14 py-0.5 px-1.5 bg-white font-bold text-portal-navy-deep text-right rounded border border-slate-200 text-body-sm shadow-2xs focus:outline-none focus:border-tiranga-saffron focus:ring-1 focus:ring-tiranga-saffron disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <span className="font-bold text-portal-navy-deep text-xs">%</span>
        </div>
      </div>
    </div>
  );
};

export default IngredientSlider;
