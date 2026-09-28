"use client";

// Stage 5 — Examine (spec §12). Promoted from modal to a document view.
// Each FATAL/OVERCOME objection carries exactly two actions:
//   1. Apply remedy in Bench — uses the same structured Directive mechanism as §7
//   2. Discuss in Legal Advisor — chat handoff
// Honesty (§14.1): offline reports are badged CLIENT-ESTIMATED and carry no
// application number; server reports state their deterministic provenance.

import React from "react";
import { PreFERReport } from "@/lib/formulation/types";

interface PreFERViewProps {
  report: PreFERReport | null;
  isLoading: boolean;
  offlineEstimated: boolean;
  onApplyRemedy: (section: string) => void;
  onDiscuss: () => void;
  onBackToBench: () => void;
}

const SEVERITY_STYLE: Record<string, { spine: string; chip: string; icon: string }> = {
  FATAL: { spine: "bg-error", chip: "bg-error-container text-on-error-container", icon: "gavel" },
  OVERCOME: { spine: "bg-tiranga-green", chip: "bg-secondary-container text-on-secondary-container", icon: "verified" },
  ADVISORY: { spine: "bg-tiranga-saffron", chip: "bg-tertiary-fixed text-on-tertiary-fixed", icon: "warning" },
};

export function PreFERView({ report, isLoading, offlineEstimated, onApplyRemedy, onDiscuss, onBackToBench }: PreFERViewProps) {
  return (
    <div className="max-w-[1000px] mx-auto space-y-4 print:max-w-none">
      {/* Letterhead */}
      <div className="rounded-xl border border-portal-border bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-tiranga-saffron via-white to-tiranga-green" />
        <div className="p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-outline">Ministry of Ayush · IP-SAKTI Sahayak</span>
            <h2 className="font-title-lg text-title-lg md:text-[26px] font-bold text-portal-navy-deep mt-1">
              Simulated First Examination Report · IPO Group 14
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">{report?.examiner_group ?? "Ayurvedic Biotechnology & Phytopharmaceuticals"}</p>
          </div>
          <div className="text-right space-y-1.5">
            {/* §14.1 — no invented identifiers, ever. */}
            <span
              className={`inline-block text-xs font-bold px-2 py-1 rounded border ${
                offlineEstimated
                  ? "bg-error-container text-on-error-container border-error/40"
                  : "bg-portal-surface-subtle text-on-surface-variant border-portal-border"
              }`}
            >
              {offlineEstimated
                ? "CLIENT-ESTIMATED — examiner service unreachable"
                : "SERVER-DETERMINISTIC — engine scoring, rehearsal only"}
            </span>
            <p className="text-xs text-outline">
              Application number: <span className="font-semibold text-on-surface">none — not filed</span>
            </p>
            {report?.provenance && <p className="text-xs text-outline max-w-[280px]">{report.provenance}</p>}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-portal-border bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span>
          <p className="font-title-md text-title-md font-bold text-portal-navy-deep mt-3">Generating examination report…</p>
          <p className="text-sm text-on-surface-variant mt-1">Auditing §3(e) synergism, §3(p) TKDL conflict, safety disclosure, and BDA Rule 13 compliance.</p>
        </div>
      )}

      {!isLoading && report && (
        <>
          {/* Patentability gauge */}
          <div className="rounded-xl border border-portal-border bg-surface-container-lowest p-5 flex flex-wrap items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E7E0D4" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={report.overall_patentability_score >= 70 ? "#1A7F4E" : report.overall_patentability_score >= 50 ? "#C0392B" : "#C0392B"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(report.overall_patentability_score / 100) * 264} 264`}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-portal-navy-deep tabular-nums">
                {report.overall_patentability_score}
              </span>
            </div>
            <div className="flex-1 min-w-[240px] space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Patentability index · /100</p>
              <p className="text-sm text-on-surface leading-relaxed">{report.summary}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${report.sec_3e_synergy_verified ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                  {report.sec_3e_synergy_verified ? "✓ §3(e) satisfied" : "🛑 §3(e) mere admixture bar"}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${report.sec_3p_tkdl_conflict ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"}`}>
                  {report.sec_3p_tkdl_conflict ? "🛑 §3(p) TKDL conflict" : "✓ §3(p) clear"}
                </span>
              </div>
            </div>
          </div>

          {/* Objections */}
          <div className="space-y-3">
            <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep">Statutory objections &amp; remedies</h3>
            {report.objections.map((obj, i) => {
              const style = SEVERITY_STYLE[obj.severity] ?? SEVERITY_STYLE.ADVISORY;
              return (
                <div key={i} className="relative rounded-xl border border-portal-border/60 bg-surface-container-lowest overflow-hidden">
                  <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.spine}`} aria-hidden />
                  <div className="pl-5 pr-4 py-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-portal-navy-deep">
                        <span className={`material-symbols-outlined text-[16px] align-middle mr-1 ${obj.severity === "FATAL" ? "text-error" : ""}`}>{style.icon}</span>
                        {obj.section} — {obj.statute}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.chip}`}>{obj.severity}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{obj.finding}</p>
                    <p className="text-sm bg-portal-surface-subtle rounded-lg border border-portal-border/60 p-3 leading-relaxed">
                      <strong className="text-portal-navy-deep">Remedy:</strong> {obj.remedy}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {obj.severity === "FATAL" && (
                        <button
                          onClick={() => onApplyRemedy(obj.section)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-container text-surface-container-lowest hover:bg-portal-navy-deep transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">build</span>
                          Apply remedy in Bench
                        </button>
                      )}
                      <button
                        onClick={onDiscuss}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-primary text-primary bg-portal-surface-subtle hover:bg-surface-container transition-colors inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                        Discuss in Legal Advisor
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim draft */}
          <div className="rounded-xl border border-portal-border/60 bg-surface-container-lowest p-4 space-y-2">
            <h3 className="font-title-md text-title-md font-bold text-portal-navy-deep">Recommended Claim Draft (Form 2)</h3>
            <div className="space-y-2 font-mono text-xs text-portal-navy-deep bg-portal-surface-subtle border border-portal-border/60 rounded-lg p-4 leading-relaxed overflow-x-auto">
              {report.recommended_claim_draft.map((c, i) => (
                <p key={i}>{c}</p>
              ))}
            </div>
            <p className="text-xs text-outline">
              WIPO GRATK 2024 disclosure: {report.wipo_gratk_status?.disclosure_obligation ?? "—"} · ABS: {report.wipo_gratk_status?.abs_clearance_status ?? "—"}
            </p>
          </div>
        </>
      )}

      <div className="flex justify-between gap-2">
        <button
          onClick={onBackToBench}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-portal-border bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Back to Bench
        </button>
      </div>
    </div>
  );
}
