"use client";

import React from "react";
import { SimulationResult } from "@/lib/formulation/types.ts";

interface PatientSafetyPanelProps {
  simulation: SimulationResult;
}

export function PatientSafetyPanel({ simulation }: PatientSafetyPanelProps) {
  const { patient_safety_warnings, overall_safety_rating } = simulation;

  const ratingMetadata = {
    EXCELLENT: {
      badge: "CLINICALLY COMPLIANT · SAFE THERAPEUTIC WINDOW",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      description:
        "All botanical and mineral constituents reside within validated pharmacopoeial safety margins. Low risk of acute adverse events or toxicological saturation.",
    },
    MODERATE_CAUTION: {
      badge: "CAUTION · HIGH ACTIVE CONCENTRATION",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
      description:
        "One or more constituents approach upper therapeutic thresholds. Sensitive populations (Paittika constitution, geriatric, lactating) require advisory labeling.",
    },
    HIGH_TOXICITY_RISK: {
      badge: "CRITICAL HAZARD · DOSAGE CEILING EXCEEDED",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-400 font-bold",
      description:
        "Constituent dosage exceeds Ayurvedic Pharmacopoeia of India (API) daily ceilings. Elevated risk of adverse patient reactions, organ stress, or prescription drug interactions.",
    },
  }[overall_safety_rating];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      {/* ── Header: Title & Clinical Safety Status ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Clinical Pharmacovigilance &amp; Toxicology
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-rose-800">
              API Daily Dosage Limits
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Patient Clinical Safety &amp; High-Quantity Hazards
          </h2>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border ${ratingMetadata.badgeColor}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                overall_safety_rating === "EXCELLENT"
                  ? "bg-emerald-500"
                  : overall_safety_rating === "MODERATE_CAUTION"
                  ? "bg-amber-500"
                  : "bg-rose-600"
              }`}
            />
            {ratingMetadata.badge}
          </span>
        </div>
      </div>

      {/* ── Status Description Banner ─────────────────────────────────── */}
      <div
        className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
          overall_safety_rating === "HIGH_TOXICITY_RISK"
            ? "bg-rose-50 border-rose-200 text-rose-950"
            : overall_safety_rating === "MODERATE_CAUTION"
            ? "bg-amber-50 border-amber-200 text-amber-950"
            : "bg-emerald-50 border-emerald-200 text-emerald-950"
        }`}
      >
        <p className="font-semibold mb-0.5">Clinical Pharmacovigilance Assessment:</p>
        <p className="text-slate-700">{ratingMetadata.description}</p>
      </div>

      {/* ── List of Detected Ingredient Hazards ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Detected Dose-Related Patient Hazards ({patient_safety_warnings.length})
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Ayurvedic Pharmacopoeia of India (API) Cross-Check
          </span>
        </div>

        {patient_safety_warnings.length === 0 ? (
          <div className="p-6 rounded-lg bg-emerald-50/40 border border-emerald-200 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-xs font-bold text-emerald-900">
              Zero High-Quantity Toxicological Hazards Detected
            </p>
            <p className="text-[11px] text-slate-600 max-w-lg mx-auto">
              Every botanical and mineral resin in this compound is maintained safely within the therapeutic window. No acute contraindications found for general adult administration.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patient_safety_warnings.map((hazard, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border space-y-3 ${
                  hazard.severity === "CRITICAL"
                    ? "bg-rose-50/60 border-rose-300"
                    : hazard.severity === "WARNING"
                    ? "bg-amber-50/60 border-amber-300"
                    : "bg-slate-50 border-slate-300"
                }`}
              >
                {/* Hazard Top: Herb & Severity Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                        hazard.severity === "CRITICAL"
                          ? "bg-rose-600 text-white border-rose-700"
                          : hazard.severity === "WARNING"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-slate-600 text-white border-slate-700"
                      }`}
                    >
                      {hazard.severity} RISK
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {hazard.herb_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500">Current Dose:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {hazard.current_dose_percent}% w/w
                    </span>
                  </div>
                </div>

                {/* Primary Hazard Title */}
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-rose-600">⚠</span>
                  <span>{hazard.hazard}</span>
                </div>

                {/* Clinical Manifestation (What happens to patient) */}
                <div className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded border border-slate-200/80">
                  <strong className="text-slate-900 font-semibold block mb-0.5">
                    Clinical Manifestations in Patients:
                  </strong>
                  {hazard.clinical_manifestation}
                </div>

                {/* Affected Vulnerable Populations & Safe API Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      High-Risk Patient Populations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {hazard.affected_populations.map((pop, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium"
                        >
                          {pop}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Safe Pharmacopoeial Guideline:
                    </span>
                    <span className="text-[11px] text-slate-800 font-mono font-medium block">
                      {hazard.safe_limit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Statutory Patient Cautionary Disclaimer ───────────────────── */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
        <svg
          className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p>
          <strong className="font-semibold text-slate-700">Statutory Ayush Notice:</strong> Toxicological warnings are derived from the Ayurvedic Pharmacopoeia of India (API) Part-I/II and Section 3(e) prior-art compounding norms. All therapeutic preparations must undergo Schedule T Good Manufacturing Practices (GMP) batch release standardization before clinical human administration.
        </p>
      </div>
    </div>
  );
}
