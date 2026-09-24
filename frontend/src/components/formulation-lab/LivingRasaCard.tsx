"use client";

import React, { useState } from "react";
import { RasaTierId, SimulationResult } from "@/lib/formulation/types.ts";

interface LivingRasaCardProps {
  simulation: SimulationResult;
  onPreviewTierChange?: (tier: RasaTierId) => void;
}

const TIER_ORDER: Array<{ id: RasaTierId; label: string; sanskrit: string }> = [
  { id: "bala", label: "Bāla", sanskrit: "बाल" },
  { id: "kumara", label: "Kumāra", sanskrit: "कुमार" },
  { id: "yuvan", label: "Yuvan", sanskrit: "युवन्" },
  { id: "vriddha", label: "Vriddha", sanskrit: "वृद्ध" },
  { id: "siddha", label: "Siddha", sanskrit: "सिद्ध" },
  { id: "divya_rasayana", label: "Rasayana", sanskrit: "दिव्य" },
];

export function LivingRasaCard({ simulation }: LivingRasaCardProps) {
  const [previewTier, setPreviewTier] = useState<RasaTierId | null>(null);
  const activeTier = previewTier || simulation.tier;

  const tierMetadata = {
    bala: {
      badge: "TIER I · RAW ADMIXTURE",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      description: "Sub-optimal baseline. Lacks bio-catalyst to overcome Section 3(e) mere admixture bar.",
    },
    kumara: {
      badge: "TIER II · NASCENT COMBINATION",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
      description: "Nascent formula showing initial additive properties; requires bio-enhancer optimization.",
    },
    yuvan: {
      badge: "TIER III · ACTIVE POTENCY",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-300",
      description: "Active formulation demonstrating measurable synergism and enhanced absorption.",
    },
    vriddha: {
      badge: "TIER IV · MATURE EQUILIBRIUM",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300",
      description: "Balanced alchemical equilibrium. Section 3(e) non-obvious synergism legally established.",
    },
    siddha: {
      badge: "TIER V · PERFECTED MASTERWORK",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      description: "Super-additive synergy. High-confidence patentability profile with accelerated BDA pathway.",
    },
    divya_rasayana: {
      badge: "TIER VI · TRANSCENDENT GRADE",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold",
      description: "Sovereign Rasayana standard. Multiplies systemic cellular bioavailability by 3.8x.",
    },
  }[activeTier];

  const powerPercent = Math.min(100, Math.round((simulation.ojas_power_score / 10000) * 100));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      {/* ── Card Header: Canonical Status ──────────────────────────────── */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border font-semibold ${tierMetadata.badgeColor}`}
          >
            {tierMetadata.badge}
          </span>

          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              simulation.sec_3e_status === "CLEARED"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : simulation.sec_3e_status === "BORDERLINE"
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            {simulation.sec_3e_status === "CLEARED"
              ? "✓ Sec 3(e) Cleared"
              : simulation.sec_3e_status === "BORDERLINE"
              ? "⚠️ Sec 3(e) Borderline"
              : "🛑 Sec 3(e) Rejection"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          {simulation.tier_sanskrit}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {tierMetadata.description}
        </p>
      </div>

      {/* ── Potency Index Progress Bar ─────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Synergistic Potency Index (Ojas)
          </span>
          <span className="font-mono font-bold text-slate-900 text-xs">
            {simulation.ojas_power_score.toLocaleString()} / 10,000
          </span>
        </div>
        <div className="w-full h-2 rounded bg-slate-100 overflow-hidden border border-slate-200">
          <div
            className="h-full bg-[#00263f] transition-all duration-300"
            style={{ width: `${powerPercent}%` }}
          />
        </div>
      </div>

      {/* ── High-Contrast Pharmacokinetic KPI Grid ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            Chou-Talalay CI
          </span>
          <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
            {simulation.chou_talalay_ci.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-600 block mt-1">
            {simulation.chou_talalay_ci < 1.0 ? "Super-Additive" : "Mere Admixture"}
          </span>
        </div>

        <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            Bioavailability
          </span>
          <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
            {simulation.bioavailability_multiplier.toFixed(1)}x
          </span>
          <span className="text-[11px] text-slate-600 block mt-1">
            Yogavāhī Multiplier
          </span>
        </div>

        <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            NF-κB Inhibition
          </span>
          <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
            +{simulation.anti_inflammatory_suppression.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-600 block mt-1">
            Anti-Inflammatory
          </span>
        </div>

        <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            NBA ABS Bracket
          </span>
          <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
            {simulation.nba_abs_royalty_percentage.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-600 block mt-1">
            Net Ex-Factory
          </span>
        </div>
      </div>

      {/* ── Tridosha Balance Segmented Indicator ───────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 text-[11px]">Tridosha Equilibrium</span>
          <span className="font-mono text-slate-500 text-[11px]">
            V: {simulation.tridosha_balance.vata}% · P: {simulation.tridosha_balance.pitta}% · K: {simulation.tridosha_balance.kapha}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded flex overflow-hidden border border-slate-200">
          <div
            className="bg-indigo-600 h-full"
            style={{ width: `${simulation.tridosha_balance.vata}%` }}
            title="Vata"
          />
          <div
            className="bg-rose-500 h-full"
            style={{ width: `${simulation.tridosha_balance.pitta}%` }}
            title="Pitta"
          />
          <div
            className="bg-emerald-600 h-full"
            style={{ width: `${simulation.tridosha_balance.kapha}%` }}
            title="Kapha"
          />
        </div>
      </div>

      {/* ── Active Pharmacological Buffs & Regulatory Flags ────────────── */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
          Active Mechanisms &amp; Sourcing Status:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {simulation.active_buffs.map((buff, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
            >
              {buff}
            </span>
          ))}
          {simulation.active_debuffs.map((debuff, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium"
            >
              {debuff}
            </span>
          ))}
        </div>
      </div>

      {/* ── Segmented Control for Tier Preview ──────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold uppercase font-mono">Stage Preview:</span>
          {previewTier && (
            <button
              onClick={() => setPreviewTier(null)}
              className="text-[#00263f] hover:underline font-semibold"
            >
              Reset to Live State
            </button>
          )}
        </div>

        <div className="grid grid-cols-6 gap-1 bg-slate-100 p-1 rounded border border-slate-200">
          {TIER_ORDER.map((t) => {
            const isSelected = activeTier === t.id;
            const isLive = simulation.tier === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setPreviewTier(t.id)}
                className={`py-1 text-center rounded text-[11px] font-medium transition-all ${
                  isSelected
                    ? "bg-[#00263f] text-white font-bold"
                    : "text-slate-600 hover:text-slate-900"
                } ${isLive && !isSelected ? "ring-1 ring-slate-400" : ""}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
