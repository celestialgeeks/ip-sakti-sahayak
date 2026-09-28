"use client";

import React from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface LivingRasaCardProps {
  simulation: SimulationResult;
}

export function LivingRasaCard({ simulation }: LivingRasaCardProps) {
  const activeTier = simulation.tier;

  const tierMetadata = {
    bala: { badge: "TIER I · RAW ADMIXTURE", badgeColor: "bg-surface-container text-outline", description: "Sub-optimal baseline. Lacks bio-catalyst to overcome Section 3(e) mere admixture bar." },
    kumara: { badge: "TIER II · NASCENT COMBINATION", badgeColor: "bg-tertiary-fixed/60 text-on-tertiary-fixed", description: "Nascent formula showing initial additive properties; requires bio-enhancer optimization." },
    yuvan: { badge: "TIER III · ACTIVE POTENCY", badgeColor: "bg-primary-fixed text-on-primary-fixed-variant", description: "Active formulation demonstrating measurable synergism and enhanced absorption." },
    vriddha: { badge: "TIER IV · MATURE EQUILIBRIUM", badgeColor: "bg-primary-container text-surface-container-lowest", description: "Balanced alchemical equilibrium. Section 3(e) non-obvious synergism legally established." },
    siddha: { badge: "TIER V · PERFECTED MASTERWORK", badgeColor: "bg-secondary-container text-on-secondary-container", description: "Super-additive synergy. High-confidence patentability profile with accelerated BDA pathway." },
    divya_rasayana: { badge: "TIER VI · TRANSCENDENT GRADE", badgeColor: "bg-tiranga-green text-white", description: "Sovereign Rasayana standard. Multiplies systemic cellular bioavailability by 3.8x." },
  }[activeTier];

  const sec3e =
    simulation.sec_3e_status === "CLEARED"
      ? { txt: "✓ Sec 3(e) Cleared", cls: "bg-secondary-container text-on-secondary-container" }
      : simulation.sec_3e_status === "BORDERLINE"
      ? { txt: "⚠ Sec 3(e) Borderline", cls: "bg-tertiary-fixed/60 text-on-tertiary-fixed" }
      : { txt: "🛑 Sec 3(e) Rejection", cls: "bg-error-container text-on-error-container" };

  const powerPercent = Math.min(100, Math.round((simulation.ojas_power_score / 10000) * 100));

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-portal-border/70 p-space-md sm:p-space-lg space-y-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-tiranga-saffron" />

      {/* ── Card Header ──────────────────────────────────────────────── */}
      <div className="space-y-2 pb-4 border-b border-surface-container pl-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded font-semibold ${tierMetadata.badgeColor}`}>
            {tierMetadata.badge}
          </span>
          <span className={`text-xs font-label-sm font-bold px-2 py-0.5 rounded ${sec3e.cls}`}>{sec3e.txt}</span>
        </div>
        <h3 className="font-headline-md text-title-lg text-portal-navy-deep font-bold">{simulation.tier_sanskrit}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{tierMetadata.description}</p>
      </div>

      {/* ── Potency Index (Ojas) ─────────────────────────────────────── */}
      <div className="space-y-1.5 pl-2">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Synergistic Potency (Ojas)</span>
          <span className="font-mono font-bold text-portal-navy-deep text-[12px]">{simulation.ojas_power_score.toLocaleString()} / 10,000</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div className="h-full bg-gradient-to-r from-tiranga-saffron to-emblem-gold transition-all duration-300" style={{ width: `${powerPercent}%` }} />
        </div>
      </div>

      {/* ── Pharmacokinetic KPI Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 pl-2">
        {[
          { k: "Chou-Talalay CI", v: simulation.chou_talalay_ci.toFixed(2), f: simulation.chou_talalay_ci < 1.0 ? "Super-Additive" : "Mere Admixture", ok: simulation.chou_talalay_ci < 1.0 },
          { k: "Bioavailability", v: `${simulation.bioavailability_multiplier.toFixed(1)}x`, f: "Yogavāhī Multiplier", ok: true },
          { k: "NF-κB Inhibition", v: `+${simulation.anti_inflammatory_suppression.toFixed(1)}%`, f: "Anti-Inflammatory", ok: true },
          { k: "NBA ABS Bracket", v: `${simulation.nba_abs_royalty_percentage.toFixed(1)}%`, f: "Net Ex-Factory", ok: true },
        ].map((m) => (
          <div key={m.k} className="p-3 rounded-lg border border-portal-border/50 bg-surface-container-low/70">
            <span className="text-[10px] font-label-sm uppercase text-outline font-semibold block">{m.k}</span>
            <span className={`text-lg font-mono font-bold mt-0.5 block ${m.ok ? "text-portal-navy-deep" : "text-error"}`}>{m.v}</span>
            <span className="text-[11px] text-on-surface-variant block mt-1">{m.f}</span>
          </div>
        ))}
      </div>

      {/* ── Tridosha Balance ─────────────────────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-surface-container pl-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-label-sm text-outline">Tridosha Equilibrium</span>
          <span className="font-mono text-on-surface-variant">V {simulation.tridosha_balance.vata}% · P {simulation.tridosha_balance.pitta}% · K {simulation.tridosha_balance.kapha}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full flex overflow-hidden border border-portal-border/50">
          <div className="bg-primary-fixed h-full" style={{ width: `${simulation.tridosha_balance.vata}%` }} title="Vata" />
          <div className="bg-tiranga-saffron h-full" style={{ width: `${simulation.tridosha_balance.pitta}%` }} title="Pitta" />
          <div className="bg-tiranga-green h-full" style={{ width: `${simulation.tridosha_balance.kapha}%` }} title="Kapha" />
        </div>
      </div>

      {/* ── Active Buffs & Flags ─────────────────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-surface-container pl-2">
        <span className="text-[10px] font-label-sm uppercase text-outline font-semibold block">Active Mechanisms &amp; Sourcing Status:</span>
        <div className="flex flex-wrap gap-1.5">
          {simulation.active_buffs.map((b, i) => (
            <span key={`b${i}`} className="text-xs px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-container border border-secondary-container font-medium">{b}</span>
          ))}
          {simulation.active_debuffs.map((d, i) => (
            <span key={`d${i}`} className="text-xs px-2 py-0.5 rounded bg-error-container/60 text-on-error-container border border-error-container font-medium">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
