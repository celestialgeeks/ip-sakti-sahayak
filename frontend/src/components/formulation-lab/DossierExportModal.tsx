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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-surface-container-lowest border border-portal-border rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-surface-container flex items-center justify-between bg-portal-surface-subtle">
          <div>
            <span className="text-[10px] uppercase font-label-sm font-bold px-2 py-0.5 rounded bg-primary-container text-surface-container-lowest">Government Regulatory Dossier</span>
            <h3 className="font-title-lg text-title-lg text-portal-navy-deep font-bold mt-1">Ministry of Ayush · ASU Drug &amp; Patent Submission Dossier</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-portal-border flex items-center justify-center text-outline hover:text-portal-navy-deep hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-on-surface font-body-md print:p-0">
          {/* Official Header */}
          <div className="text-center border-b pb-5 border-portal-border space-y-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-portal-navy-deep">Government of India · Ministry of Ayush</h2>
            <h3 className="text-xs font-semibold text-on-surface-variant">Traditional Knowledge Digital Library &amp; ASU Drug Clearance Division</h3>
            <div className="text-[11px] font-mono text-outline mt-2">Dossier Ref: AYUSH/FL/{Date.now().toString().slice(-8)} · Form 158-B Format</div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-outline font-label-sm">1. Product Identification &amp; Statutory Classification</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg border border-portal-border/60 bg-surface-container-low/70">
              <div>
                <span className="text-[10px] text-outline block font-label-sm">Formulation Title:</span>
                <span className="font-bold text-portal-navy-deep">{simulation.title}</span>
              </div>
              <div>
                <span className="text-[10px] text-outline block font-label-sm">Stage Category:</span>
                <span className="font-bold text-portal-navy-deep font-title-md">{simulation.tier_sanskrit}</span>
              </div>
              <div>
                <span className="text-[10px] text-outline block font-label-sm">Combination Index:</span>
                <span className="font-mono font-bold text-portal-navy-deep">{simulation.chou_talalay_ci.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-outline block font-label-sm">NBA Royalty Status:</span>
                <span className="font-mono font-bold text-portal-navy-deep">{simulation.nba_abs_royalty_percentage.toFixed(1)}% Ex-Factory</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-outline font-label-sm">2. Stoichiometric Formula &amp; Standardized Markers</h4>
            <table className="w-full text-left text-xs border border-portal-border/60 border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-portal-surface-subtle border-b border-portal-border text-outline text-[10px] uppercase font-label-sm">
                  <th className="p-2.5 font-semibold">Botanical / Common Name</th>
                  <th className="p-2.5 font-semibold">Latin Binomial</th>
                  <th className="p-2.5 font-semibold">Part Used</th>
                  <th className="p-2.5 font-semibold">Standardized Marker</th>
                  <th className="p-2.5 font-semibold text-right">Ratio (% w/w)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portal-border/40">
                {ingredients.map((ing) => {
                  const herb = botanicalsMap.get(ing.herb_id);
                  return (
                    <tr key={ing.herb_id} className="hover:bg-surface-container-low/50">
                      <td className="p-2.5 font-bold text-portal-navy-deep">{herb?.common_name || ing.herb_id}</td>
                      <td className="p-2.5 italic text-on-surface-variant">{herb?.botanical_name}</td>
                      <td className="p-2.5 text-on-surface-variant">{herb?.part_used}</td>
                      <td className="p-2.5 text-on-surface font-mono text-[11px]">{herb?.marker_compound}</td>
                      <td className="p-2.5 font-mono font-bold text-right text-portal-navy-deep">{ing.ratio.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-outline font-label-sm">3. Statutory Legal Certifications</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-lg border border-portal-border/60 bg-surface-container-low/70 text-on-surface leading-relaxed">
                <strong className="text-portal-navy-deep">Indian Patents Act 1970 §3(e):</strong> Combination index of {simulation.chou_talalay_ci.toFixed(2)} substantiates non-obvious synergistic enhancement. Mere admixture rejection successfully overcome.
              </div>
              <div className="p-3.5 rounded-lg border border-portal-border/60 bg-surface-container-low/70 text-on-surface leading-relaxed">
                <strong className="text-portal-navy-deep">Biological Diversity Act 2024:</strong> Classified as {simulation.nba_form_tier} with an ex-factory commercial return rate of {simulation.nba_abs_royalty_percentage.toFixed(1)}%.
              </div>
              <div className="p-3.5 rounded-lg border border-portal-border/60 bg-surface-container-low/70 text-on-surface leading-relaxed">
                <strong className="text-portal-navy-deep">TKDL Canonical Treatise Concordance:</strong> {simulation.tkdl_concordance_score}% adherence to <em>{simulation.tkdl_shloka_match}</em>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-container bg-portal-surface-subtle flex items-center justify-between">
          <span className="text-[11px] font-mono text-outline">Formulation Lab · IP-SAKTI Sahayak</span>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-3.5 py-2 rounded-lg text-label-sm font-label-sm font-semibold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant transition-colors">
              Print / Save PDF
            </button>
            <button onClick={handleDownloadJSON} className="px-3.5 py-2 rounded-lg text-label-sm font-label-sm font-semibold bg-primary-container hover:bg-portal-navy-deep text-surface-container-lowest transition-colors">
              Download JSON Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
