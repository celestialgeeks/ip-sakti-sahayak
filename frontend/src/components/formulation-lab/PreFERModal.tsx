"use client";

import React from "react";
import { PreFERReport } from "@/lib/formulation/types.ts";

interface PreFERModalProps {
  report: PreFERReport | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function PreFERModal({
  report,
  isOpen,
  onClose,
  isLoading,
}: PreFERModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-[#00263f] font-bold border border-blue-200">
                Official Patent Simulation
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {report?.application_no || "IN/2026/AYUSH/..."}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Indian Patent Office (IPO) · First Examination Report (FER)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-[#00263f] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-bold text-slate-900 text-sm">
                Generating Examination Report...
              </p>
              <p className="text-slate-500 mt-1">
                Auditing Section 3(e) synergism, Section 3(p) TKDL conflict, and BDA Rule 13 compliance.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Assessment Box */}
              <div className="p-5 rounded border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Patentability Index Score
                  </span>
                  <div className="text-3xl font-mono font-bold text-slate-900 mt-0.5">
                    {report.overall_patentability_score} / 100
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Examined by: {report.examiner_group}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold inline-block self-end border ${
                      report.sec_3e_synergy_verified
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-rose-50 text-rose-800 border-rose-300"
                    }`}
                  >
                    {report.sec_3e_synergy_verified
                      ? "✓ Section 3(e) Synergism Satisfied"
                      : "🛑 Section 3(e) Mere Admixture Bar"}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Filing Date: {report.filing_date}
                  </span>
                </div>
              </div>

              {/* Examiner Summary */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Examiner's Formal Statement
                </h4>
                <p className="bg-slate-50 p-3.5 rounded border border-slate-200 leading-relaxed text-slate-700">
                  {report.summary}
                </p>
              </div>

              {/* Objections List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Statutory Objections &amp; Legal Remedies (Sections 3(e), 3(p), 6)
                </h4>
                <div className="space-y-3">
                  {report.objections.map((obj, i) => (
                    <div
                      key={i}
                      className="p-4 rounded border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {obj.section} — {obj.statute}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            obj.severity === "FATAL"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : obj.severity === "OVERCOME"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {obj.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Finding:</strong> {obj.finding}
                      </p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                        <strong className="text-slate-900">Recommended Legal Remedy:</strong> {obj.remedy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Claim Draft */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Recommended Claim Draft (Form 2 Format)
                </h4>
                <div className="p-4 rounded bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] space-y-2 overflow-x-auto leading-relaxed">
                  {report.recommended_claim_draft.map((c, i) => (
                    <p key={i}>{c}</p>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-semibold bg-[#00263f] hover:bg-[#083b5c] text-white transition-colors"
          >
            Close Examination Report
          </button>
        </div>
      </div>
    </div>
  );
}
