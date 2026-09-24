"use client";

import React from "react";
import { BotanicalItem, IngredientRatio, SimulationResult } from "@/lib/formulation/types.ts";

interface DossierExportModalProps {
  simulation: SimulationResult;
  ingredients: IngredientRatio[];
  botanicals: BotanicalItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function DossierExportModal({
  simulation,
  ingredients,
  botanicals,
  isOpen,
  onClose,
}: DossierExportModalProps) {
  if (!isOpen) return null;

  const botanicalsMap = new Map<string, BotanicalItem>();
  botanicals.forEach((b) => botanicalsMap.set(b.id, b));

  const handleDownloadJSON = () => {
    const payload = {
      title: simulation.title,
      date_generated: new Date().toISOString(),
      statutory_compliance: {
        chou_talalay_ci: simulation.chou_talalay_ci,
        sec_3e_status: simulation.sec_3e_status,
        nba_abs_royalty: `${simulation.nba_abs_royalty_percentage}%`,
        nba_tier: simulation.nba_form_tier,
        tkdl_canon_match: simulation.tkdl_shloka_match,
      },
      stoichiometric_formula: ingredients.map((i) => ({
        herb_id: i.herb_id,
        botanical_name: botanicalsMap.get(i.herb_id)?.botanical_name,
        common_name: botanicalsMap.get(i.herb_id)?.common_name,
        ratio_percentage: i.ratio,
        marker_compound: botanicalsMap.get(i.herb_id)?.marker_compound,
      })),
      hplc_markers: simulation.hplc_markers,
      production_economics: simulation.cost_waterfall,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ayush_Formulation_Dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#00263f] border border-blue-200">
              Government Regulatory Dossier
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Ministry of Ayush · ASU Drug &amp; Patent Submission Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans print:p-0">
          {/* Official Header */}
          <div className="text-center border-b pb-5 border-slate-200 space-y-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#00263f]">
              GOVERNMENT OF INDIA · MINISTRY OF AYUSH
            </h2>
            <h3 className="text-xs font-semibold text-slate-500">
              Traditional Knowledge Digital Library &amp; ASU Drug Clearance Division
            </h3>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Dossier Ref: AYUSH/FL/{Date.now().toString().slice(-8)} · Form 158-B Format
            </div>
          </div>

          {/* Section 1: Product Identification */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              1. Product Identification &amp; Statutory Classification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded border border-slate-200 bg-slate-50/60">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Formulation Title:</span>
                <span className="font-bold text-slate-900">{simulation.title}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Stage Category:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {simulation.tier_sanskrit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Combination Index:</span>
                <span className="font-mono font-bold text-slate-900">{simulation.chou_talalay_ci.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">NBA Royalty Status:</span>
                <span className="font-mono font-bold text-slate-900">
                  {simulation.nba_abs_royalty_percentage.toFixed(1)}% Ex-Factory
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Stoichiometric Botanical Composition */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              2. Stoichiometric Formula &amp; Standardized Markers
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 border-collapse rounded overflow-hidden">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                  <th className="p-2.5 font-semibold">Botanical / Common Name</th>
                  <th className="p-2.5 font-semibold">Latin Binomial</th>
                  <th className="p-2.5 font-semibold">Part Used</th>
                  <th className="p-2.5 font-semibold">Standardized Marker</th>
                  <th className="p-2.5 font-semibold text-right">Ratio (% w/w)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.map((ing) => {
                  const herb = botanicalsMap.get(ing.herb_id);
                  return (
                    <tr key={ing.herb_id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-900">{herb?.common_name || ing.herb_id}</td>
                      <td className="p-2.5 italic text-slate-500">{herb?.botanical_name}</td>
                      <td className="p-2.5 text-slate-600">{herb?.part_used}</td>
                      <td className="p-2.5 text-slate-700 font-mono text-[11px]">
                        {herb?.marker_compound}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-right text-slate-900">{ing.ratio.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: Statutory Legal Certifications */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              3. Statutory Legal Certifications
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50 text-slate-700 leading-relaxed">
                <strong>Indian Patents Act 1970 §3(e):</strong> Combination index of {simulation.chou_talalay_ci.toFixed(2)}{" "}
                substantiates non-obvious synergistic enhancement. Mere admixture rejection successfully overcome.
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50 text-slate-700 leading-relaxed">
                <strong>Biological Diversity Act 2024:</strong> Classified as{" "}
                {simulation.nba_form_tier} with an ex-factory commercial return rate of{" "}
                {simulation.nba_abs_royalty_percentage.toFixed(1)}%.
              </div>
              <div className="p-3.5 rounded border border-slate-200 bg-slate-50 text-slate-700 leading-relaxed">
                <strong>TKDL Canonical Treatise Concordance:</strong> {simulation.tkdl_concordance_score}% adherence to{" "}
                <em>{simulation.tkdl_shloka_match}</em>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Formulation Lab · IP-SAKTI Sahayak
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded text-xs font-semibold bg-[#00263f] hover:bg-[#083b5c] text-white transition-colors"
            >
              Download JSON Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
