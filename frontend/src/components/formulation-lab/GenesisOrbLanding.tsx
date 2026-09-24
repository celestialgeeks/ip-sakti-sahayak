"use client";

import React from "react";
import { BotanicalItem, PresetFormulation } from "@/lib/formulation/types.ts";

interface GenesisOrbLandingProps {
  presets: PresetFormulation[];
  botanicals: BotanicalItem[];
  onSelectPreset: (preset: PresetFormulation) => void;
  onAddHerb: (herbId: string, defaultRatio?: number) => void;
}

export function GenesisOrbLanding({
  presets,
  botanicals,
  onSelectPreset,
  onAddHerb,
}: GenesisOrbLandingProps) {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 space-y-10">
      {/* ── Page Header: Official Ayush / Legal-Tech Minimalist ─────────── */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-[#00263f] text-xs font-semibold tracking-wide border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
            Official Formulation Workbench · Ministry of Ayush
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-500">
            Patents Act §3(e) &amp; BDA 2024 Compliant
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00263f] tracking-tight">
              Formulation Laboratory &amp; Ratio Simulator
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Design and evaluate botanical formulations against statutory patentability barriers.
              Simulate stoichiometric dosage variations in real time to calculate the{" "}
              <strong className="text-slate-900 font-semibold">Chou-Talalay Combination Index (CI)</strong>, verify{" "}
              <strong className="text-slate-900 font-semibold">Section 3(e)</strong> non-obvious synergism, and determine{" "}
              <strong className="text-slate-900 font-semibold">National Biodiversity Authority (NBA)</strong> Access and Benefit-Sharing obligations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Simulation Engine</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active · 0ms Client Latency
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Starter Archetype Cards Grid (Clean Swiss-style Containers) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Validated Formulation Archetypes
            </h2>
            <p className="text-xs text-slate-500">
              Select an authoritative classical or proprietary benchmark to load into the stoichiometric matrix.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {presets.length} Presets Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group bg-white rounded-lg border border-slate-200 hover:border-[#00263f] p-5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {preset.target_tier.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {preset.ingredients.length} Constituents
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00263f] transition-colors leading-snug">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#00263f] group-hover:underline flex items-center gap-1">
                  Load Archetype <span>→</span>
                </span>
                <span className="text-xs font-mono text-slate-400">100.0% w/w</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Botanical Herbarium Quick-Start Board ─────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Initialize Custom Formulation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select foundation botanicals to initiate stoichiometric ratios from scratch.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {botanicals.map((herb) => (
            <button
              key={herb.id}
              onClick={() => onAddHerb(herb.id, 25.0)}
              className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-[#00263f] hover:bg-slate-50/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#00263f] block truncate">
                  {herb.common_name}
                </span>
                <span className="text-[11px] italic text-slate-400 block truncate mt-0.5">
                  {herb.botanical_name}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-mono text-slate-500 uppercase">{herb.category}</span>
                <span className="font-semibold text-[#00263f]">+ Add</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Statutory Standards & Methodology Notice ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">
            1. Patents Act 1970 §3(e)
          </span>
          <p className="leading-relaxed">
            Mere admixtures resulting only in aggregation of properties are excluded from patentability.
            The simulator evaluates the median-effect equation to substantiate non-obvious synergistic enhancement.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">
            2. Biological Diversity Act 2024
          </span>
          <p className="leading-relaxed">
            Commercial use of Indian biological resources mandates NBA approval and fair commercial return.
            Calculates Schedule I net ex-factory ABS liabilities and flags high-scrutiny mineral components.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">
            3. TKDL &amp; First Schedule Canon
          </span>
          <p className="leading-relaxed">
            Compares active ratios against canonical treatises (Charaka Samhita, Rasatarangini, and API monographs)
            to determine ASU Drug Licensing pathways vs proprietary patent claims.
          </p>
        </div>
      </div>
    </div>
  );
}
