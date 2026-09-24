"use client";

import React, { useState } from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface StatutoryAccordionsProps {
  simulation: SimulationResult;
  onRunPreFER: () => void;
  onExportDossier: () => void;
  onOpenChatWithFormulation: () => void;
}

export function StatutoryAccordions({
  simulation,
  onRunPreFER,
  onExportDossier,
  onOpenChatWithFormulation,
}: StatutoryAccordionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const panels = [
    {
      title: "1. Phytochemical Fingerprinting & HPLC Marker Assay",
      badge: "API Monograph Limits",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            High-Performance Liquid Chromatography (HPLC) assay marker profile benchmarked against authoritative
            <strong> Ayurvedic Pharmacopoeia of India (API)</strong> monograph limits.
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                  <th className="py-2.5 px-3 font-semibold">Standardized Marker</th>
                  <th className="py-2.5 px-3 font-semibold">Botanical Source</th>
                  <th className="py-2.5 px-3 font-semibold">Detected Yield</th>
                  <th className="py-2.5 px-3 font-semibold">API Monograph Standard</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulation.hplc_markers.map((marker, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{marker.marker}</td>
                    <td className="py-2.5 px-3 italic text-slate-500">{marker.botanical}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {marker.detected}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{marker.api_spec}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          marker.compliance === "PASS" || marker.compliance === "OPTIMAL"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {marker.compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      title: "2. Chou-Talalay Combination Synergy Matrix",
      badge: `CI Score: ${simulation.chou_talalay_ci.toFixed(2)}`,
      badgeColor:
        simulation.sec_3e_status === "CLEARED"
          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
          : "bg-rose-50 text-rose-800 border-rose-300",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pairwise combination analysis evaluating pharmacological interaction coefficients ($\alpha$).
            Super-additive scores ($CI &lt; 0.85$) substantiate non-obvious potentiation required to overcome{" "}
            <strong>Section 3(e)</strong> mere admixture objections at the Indian Patent Office.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {simulation.pairwise_synergy.map((pair, idx) => (
              <div key={idx} className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 text-xs">Pair {idx + 1}</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] border ${
                      pair.ci_score < 0.85
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    CI: {pair.ci_score.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {pair.herb_a} × {pair.herb_b}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{pair.mechanism}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "3. Biological Diversity Act 2024 · NBA Benefit-Sharing Schedule",
      badge: `${simulation.nba_abs_royalty_percentage.toFixed(1)}% Ex-Factory`,
      badgeColor: "bg-blue-50 text-blue-800 border-blue-300",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory assessment under the <strong>Biological Diversity (Amendment) Act 2023</strong> &amp;{" "}
            <strong>ABS Regulations 2024 (Gazette 22 Oct 2024)</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Application Category
              </span>
              <h4 className="text-sm font-bold text-slate-900">{simulation.nba_form_tier}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Commercial utilization of Indian biological resources mandates filing Form III prior to commercial sale or patent grant.
              </p>
            </div>
            <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Fair &amp; Equitable Return Obligation
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {simulation.nba_abs_royalty_percentage.toFixed(1)}% of Net Ex-Factory Sales
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Schedule I commercial royalty bracket. Sourcing cultivated certified materials provides eligibility for rebate.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "4. Section 3(e) & Section 3(p) Patent Defense Certificate",
      badge: "InPASS Precedents Verified",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Formal defense statement overcoming traditional knowledge bars under Section 3(p) and admixture bars under Section 3(e).
          </p>
          <div className="p-4 rounded border border-slate-200 bg-slate-50 text-xs space-y-2 text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block text-xs">
              Section 3(e) Synergism Verification Statement:
            </span>
            <p>
              The stoichiometric composition demonstrates non-obvious synergistic enhancement with a combination index of{" "}
              <strong>{simulation.chou_talalay_ci.toFixed(2)}</strong>. Suppression of anti-inflammatory markers is elevated by{" "}
              <strong>+{simulation.anti_inflammatory_suppression.toFixed(1)}%</strong> over single-agent controls, satisfying the evidentiary burden established in Controller of Patents ASU Invention Examination Guidelines.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "5. Production Economics & Unit Margin Waterfall",
      badge: "Unit Margin ~43% EBITDA",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Industrial manufacturing breakdown per 500mg therapeutic unit compliant with Schedule T (Good Manufacturing Practices).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {simulation.cost_waterfall.map((step, idx) => (
              <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50/50 text-center space-y-1">
                <span className="text-[10px] text-slate-500 block truncate">{step.stage}</span>
                <span className="text-base font-mono font-bold text-slate-900 block">
                  ₹{step.cost_inr.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{step.unit}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "6. Classical Treatises & Canonical Concordance",
      badge: `${simulation.tkdl_concordance_score}% Concordance`,
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Concordance audit against authoritative classical Ayurvedic texts listed under the First Schedule of the Drugs and Cosmetics Act 1940.
          </p>
          <div className="p-4 rounded border border-slate-200 bg-slate-50/50 text-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Canonical Text Match:
            </span>
            <div className="font-serif italic text-slate-900 text-sm font-semibold">
              "{simulation.tkdl_shloka_match}"
            </div>
            <p className="text-slate-500 leading-relaxed">
              Formulations strictly adhering to classical canon qualify for expedited ASU Manufacturing Licensing without Phase I-III clinical trial mandates.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Action Toolbar: Crisp Gov-Tech Styling ─────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Statutory Examination &amp; Regulatory Dossier
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute mock patent examination, download submissions, or consult legal AI assistant.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onRunPreFER}
            className="px-3.5 py-2 rounded text-xs font-semibold bg-[#00263f] hover:bg-[#083b5c] text-white transition-colors"
          >
            Run Pre-FER Patent Check
          </button>
          <button
            onClick={onExportDossier}
            className="px-3.5 py-2 rounded text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Export Regulatory Dossier
          </button>
          <button
            onClick={onOpenChatWithFormulation}
            className="px-3.5 py-2 rounded text-xs font-semibold border border-[#00263f] bg-blue-50/50 hover:bg-blue-50 text-[#00263f] transition-colors"
          >
            Consult Legal Assistant →
          </button>
        </div>
      </div>

      {/* ── Collapsible Structured Panels ─────────────────────────────── */}
      <div className="space-y-2">
        {panels.map((p, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{p.title}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono ml-2">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="p-4 pt-2 border-t border-slate-100">{p.content}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
