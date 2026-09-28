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
      badgeColor: "bg-secondary-container text-on-secondary-container",
      dot: "bg-tiranga-green",
      banner: "bg-secondary-container/25 border-secondary-container text-on-secondary-container",
      description: "All botanical and mineral constituents reside within validated pharmacopoeial safety margins. Low risk of acute adverse events or toxicological saturation.",
    },
    MODERATE_CAUTION: {
      badge: "CAUTION · HIGH ACTIVE CONCENTRATION",
      badgeColor: "bg-tertiary-fixed/70 text-on-tertiary-fixed",
      dot: "bg-emblem-gold",
      banner: "bg-tertiary-fixed/40 border-emblem-gold/40 text-on-tertiary-fixed",
      description: "One or more constituents approach upper therapeutic thresholds. Sensitive populations (Paittika constitution, geriatric, lactating) require advisory labeling.",
    },
    HIGH_TOXICITY_RISK: {
      badge: "CRITICAL HAZARD · DOSAGE CEILING EXCEEDED",
      badgeColor: "bg-error-container text-on-error-container",
      dot: "bg-error",
      banner: "bg-error-container/40 border-error/40 text-on-error-container",
      description: "Constituent dosage exceeds Ayurvedic Pharmacopoeia of India (API) daily ceilings. Elevated risk of adverse patient reactions, organ stress, or prescription drug interactions.",
    },
  }[overall_safety_rating];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-portal-border/70 p-space-md sm:p-space-lg space-y-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-error" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container pl-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-label-sm uppercase tracking-wider text-outline font-semibold">Clinical Pharmacovigilance &amp; Toxicology</span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs font-semibold text-error">API Daily Dosage Limits</span>
          </div>
          <h2 className="font-title-lg text-title-lg text-portal-navy-deep font-bold tracking-tight">Patient Clinical Safety &amp; High-Quantity Hazards</h2>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-label-sm font-label-sm font-bold ${ratingMetadata.badgeColor}`}>
          <span className={`w-2 h-2 rounded-full ${ratingMetadata.dot}`} />
          {ratingMetadata.badge}
        </span>
      </div>

      {/* ── Status Description Banner ────────────────────────────────── */}
      <div className={`p-3.5 rounded-lg border text-xs leading-relaxed pl-2 ${ratingMetadata.banner}`}>
        <p className="font-semibold mb-0.5">Clinical Pharmacovigilance Assessment:</p>
        <p className="text-on-surface-variant">{ratingMetadata.description}</p>
      </div>

      {/* ── Detected Hazards ─────────────────────────────────────────── */}
      <div className="space-y-4 pl-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-portal-navy-deep">Detected Dose-Related Patient Hazards ({patient_safety_warnings.length})</span>
          <span className="text-[11px] font-label-sm text-outline">Ayurvedic Pharmacopoeia of India (API) Cross-Check</span>
        </div>

        {patient_safety_warnings.length === 0 ? (
          <div className="p-6 rounded-lg bg-secondary-container/25 border border-secondary-container text-center space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container mx-auto">
              <span className="material-symbols-outlined text-[20px]">check</span>
            </div>
            <p className="text-xs font-bold text-on-secondary-container">Zero High-Quantity Toxicological Hazards Detected</p>
            <p className="text-[11px] text-on-surface-variant max-w-lg mx-auto">
              Every botanical and mineral resin in this compound is maintained safely within the therapeutic window. No acute contraindications found for general adult administration.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patient_safety_warnings.map((hazard, index) => {
              const sev =
                hazard.severity === "CRITICAL"
                  ? { card: "bg-error-container/30 border-error/40", badge: "bg-error text-on-error" }
                  : hazard.severity === "WARNING"
                  ? { card: "bg-tertiary-fixed/40 border-emblem-gold/40", badge: "bg-emblem-gold text-white" }
                  : { card: "bg-surface-container-low border-portal-border", badge: "bg-primary-container text-surface-container-lowest" };
              return (
                <div key={index} className={`p-4 rounded-lg border space-y-3 ${sev.card}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-label-sm uppercase font-bold px-2 py-0.5 rounded ${sev.badge}`}>{hazard.severity} RISK</span>
                      <h3 className="text-sm font-bold text-portal-navy-deep font-title-md">{hazard.herb_name}</h3>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-outline">Current Dose:</span>
                      <span className="font-bold text-portal-navy-deep bg-surface-container-lowest px-2 py-0.5 rounded border border-portal-border">{hazard.current_dose_percent}% w/w</span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-portal-navy-deep flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                    <span>{hazard.hazard}</span>
                  </div>

                  <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest/70 p-3 rounded border border-portal-border/60">
                    <strong className="text-portal-navy-deep font-semibold block mb-0.5">Clinical Manifestations in Patients:</strong>
                    {hazard.clinical_manifestation}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[11px] font-semibold text-outline block mb-1">High-Risk Patient Populations:</span>
                      <div className="flex flex-wrap gap-1">
                        {hazard.affected_populations.map((pop, pIdx) => (
                          <span key={pIdx} className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant border border-portal-border text-[10px] font-medium">{pop}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-outline block mb-1">Safe Pharmacopoeial Guideline:</span>
                      <span className="text-[11px] text-portal-navy-deep font-mono font-medium block">{hazard.safe_limit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Statutory Disclaimer ─────────────────────────────────────── */}
      <div className="p-3 bg-portal-surface-subtle rounded-lg border border-portal-border/60 text-[11px] text-on-surface-variant leading-relaxed flex items-start gap-2 pl-2">
        <span className="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">info</span>
        <p>
          <strong className="font-semibold text-portal-navy-deep">Statutory Ayush Notice:</strong> Toxicological warnings are derived from the Ayurvedic Pharmacopoeia of India (API) Part-I/II and Section 3(e) prior-art compounding norms. All therapeutic preparations must undergo Schedule T Good Manufacturing Practices (GMP) batch release standardization before clinical human administration.
        </p>
      </div>
    </div>
  );
}
