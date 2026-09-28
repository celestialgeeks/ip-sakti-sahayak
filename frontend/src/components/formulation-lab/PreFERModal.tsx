"use client";

import React from "react";
import { PreFERReport } from "@/lib/formulation/types.ts";

interface PreFERModalProps {
  report: PreFERReport | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function PreFERModal({ report, isOpen, onClose, isLoading }: PreFERModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface-container-lowest border border-portal-border rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-surface-container flex items-center justify-between bg-portal-surface-subtle relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tiranga-saffron via-surface-container-lowest to-tiranga-green opacity-90" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-label-sm px-2 py-0.5 rounded bg-primary-container text-surface-container-lowest font-bold">Official Patent Simulation</span>
              <span className="text-xs text-on-surface-variant font-mono">{report?.application_no || "IN/2026/AYUSH/..."}</span>
            </div>
            <h3 className="font-title-lg text-title-lg text-portal-navy-deep font-bold mt-1">Indian Patent Office (IPO) · First Examination Report (FER)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-portal-border flex items-center justify-center text-outline hover:text-portal-navy-deep hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-on-surface">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[36px] text-primary animate-spin mb-4">sync</span>
              <p className="font-bold text-portal-navy-deep text-sm font-title-md">Generating Examination Report...</p>
              <p className="text-on-surface-variant mt-1">Auditing Section 3(e) synergism, Section 3(p) TKDL conflict, and BDA Rule 13 compliance.</p>
            </div>
          ) : report ? (
            <>
              {/* Executive Assessment Box */}
              <div className="p-5 rounded-xl border border-portal-border/60 bg-surface-container-low/70 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-label-sm font-bold text-outline block">Patentability Index Score</span>
                  <div className="font-headline-lg text-headline-lg font-bold text-portal-navy-deep mt-0.5">{report.overall_patentability_score} / 100</div>
                  <span className="text-[11px] text-on-surface-variant">Examined by: {report.examiner_group}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block self-end ${report.sec_3e_synergy_verified ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                    {report.sec_3e_synergy_verified ? "✓ Section 3(e) Synergism Satisfied" : "🛑 Section 3(e) Mere Admixture Bar"}
                  </span>
                  <span className="text-[11px] font-mono text-outline">Filing Date: {report.filing_date}</span>
                </div>
              </div>

              {/* Examiner Summary */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-portal-navy-deep text-xs uppercase tracking-wider font-label-sm">Examiner's Formal Statement</h4>
                <p className="bg-portal-surface-subtle p-3.5 rounded-lg border border-portal-border/60 leading-relaxed text-on-surface-variant">{report.summary}</p>
              </div>

              {/* Objections List */}
              <div className="space-y-3">
                <h4 className="font-bold text-portal-navy-deep text-xs uppercase tracking-wider font-label-sm">Statutory Objections &amp; Legal Remedies (Sections 3(e), 3(p), 6)</h4>
                <div className="space-y-3">
                  {report.objections.map((obj, i) => {
                    const sev =
                      obj.severity === "FATAL"
                        ? { chip: "bg-error-container text-on-error-container", spine: "bg-error" }
                        : obj.severity === "OVERCOME"
                        ? { chip: "bg-secondary-container text-on-secondary-container", spine: "bg-tiranga-green" }
                        : { chip: "bg-tertiary-fixed/60 text-on-tertiary-fixed", spine: "bg-emblem-gold" };
                    return (
                      <div key={i} className="p-4 rounded-xl border border-portal-border/60 bg-surface-container-lowest space-y-2 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${sev.spine}`} />
                        <div className="flex items-center justify-between pl-2">
                          <span className="font-mono font-bold text-xs text-portal-navy-deep">{obj.section} — {obj.statute}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sev.chip}`}>{obj.severity}</span>
                        </div>
                        <p className="text-on-surface-variant leading-relaxed pl-2"><strong className="text-portal-navy-deep">Finding:</strong> {obj.finding}</p>
                        <p className="text-on-surface bg-portal-surface-subtle p-2.5 rounded-lg border border-portal-border/60 leading-relaxed pl-2"><strong className="text-portal-navy-deep">Recommended Legal Remedy:</strong> {obj.remedy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Claim Draft */}
              <div className="space-y-2">
                <h4 className="font-bold text-portal-navy-deep text-xs uppercase tracking-wider font-label-sm">Recommended Claim Draft (Form 2 Format)</h4>
                <div className="p-4 rounded-lg bg-portal-surface-subtle border border-portal-border/60 text-portal-navy-deep font-mono text-[11px] space-y-2 overflow-x-auto leading-relaxed">
                  {report.recommended_claim_draft.map((c, i) => (
                    <p key={i}>{c}</p>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-container bg-portal-surface-subtle flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-label-sm font-label-sm font-semibold bg-primary-container hover:bg-portal-navy-deep text-surface-container-lowest transition-colors">
            Close Examination Report
          </button>
        </div>
      </div>
    </div>
  );
}
