// Adaptive next-action gate ladder (spec §7) and the verdict line (§6).
// ONE source of truth: the CTA button, the verdict sentence, and Guided-mode
// narration all come from these functions, so they can never state different
// problems. Deterministic, ordered — first match wins.

import type { Directive, PatientSafetyHazard, SimulationResult } from "./types.ts";

export type GateId =
  | "empty"
  | "unbalanced"
  | "critical_safety"
  | "entity"
  | "sec3e"
  | "sec3p"
  | "bio"
  | "run_prefer"
  | "apply_remedy"
  | "export";

export type Lens = "medicine" | "law" | "money";

export interface GateInput {
  ingredientCount: number;
  sim: SimulationResult;
  entityChosen: boolean;
  preFerRun: boolean;
  /** FATAL objections from the last Pre-FER run (0 if not run). */
  fatalDirectives: Directive[];
}

export interface NextAction {
  gate: GateId;
  label: string;
  /** Projected impact shown *before* clicking (spec: Apply is an informed act). */
  impact?: string;
  /** Structured directive to apply, when Apply mutates the bench. */
  directive?: Directive;
  /** Which UI action the click fires instead of a directive. */
  fire: "open_herb_drawer" | "autobalance" | "focus_entity" | "run_prefer" | "apply_remedy" | "goto_export";
  herbId?: string;
}

function findDirective(
  sim: SimulationResult,
  herbId: string,
  actionTypes: Directive["action_type"][]
): Directive | undefined {
  const all = [...sim.how_to_improve, ...sim.what_to_remove];
  return all.find((d) => d.herb_id === herbId && actionTypes.includes(d.action_type));
}

function criticalWarning(sim: SimulationResult): PatientSafetyHazard | undefined {
  return sim.patient_safety_warnings.find((w) => w.severity === "CRITICAL");
}

/** §7 ladder, first match wins. */
export function computeNextAction(input: GateInput): NextAction {
  const { ingredientCount, sim, entityChosen, preFerRun, fatalDirectives } = input;

  if (ingredientCount === 0) {
    return { gate: "empty", label: "Add your first herb", fire: "open_herb_drawer" };
  }

  if (Math.abs(sim.total_ratio - 100.0) > 0.05) {
    return {
      gate: "unbalanced",
      label: `Normalise to 100.0% w/w (now ${sim.total_ratio.toFixed(1)}%)`,
      fire: "autobalance",
    };
  }

  const crit = criticalWarning(sim);
  if (crit) {
    const fix = sim.contributions?.find((c) => c.herb_id === crit.herb_id)?.fix;
    const target = fix ? fix.target_ratio : 5.0;
    return {
      gate: "critical_safety",
      label: `Reduce ${crit.herb_name.split(" (")[0]} to ${target}% — ${crit.hazard.split(" & ")[0]}`,
      impact: fix?.projected_impact,
      directive: fix ?? { action_type: "decrease", herb_id: crit.herb_id, target_ratio: target },
      fire: "apply_remedy",
      herbId: crit.herb_id,
    };
  }

  if (!entityChosen) {
    return {
      gate: "entity",
      label: "Declare entity type — moves royalty 3.0% → 5.0%",
      fire: "focus_entity",
    };
  }

  if (sim.sec_3e_status !== "CLEARED") {
    const pipFix =
      findDirective(sim, "pippali", ["add", "increase"]) ??
      ({ action_type: "add", herb_id: "pippali", target_ratio: 5.0 } as Directive);
    return {
      gate: "sec3e",
      label: `Add Pippali ${pipFix.target_ratio}% → CI ${sim.chou_talalay_ci} → clears §3(e)`,
      impact: pipFix.projected_impact,
      directive: pipFix,
      fire: "apply_remedy",
      herbId: "pippali",
    };
  }

  if (sim.tkdl_concordance_score >= 90) {
    const gudFix =
      findDirective(sim, "guduchi", ["add", "increase"]) ??
      ({ action_type: "add", herb_id: "guduchi", target_ratio: 6.0 } as Directive);
    return {
      gate: "sec3p",
      label: `Add Guduchi ${gudFix.target_ratio}% → drop TKDL ${sim.tkdl_concordance_score} under §3(p) 90`,
      impact: gudFix.projected_impact,
      directive: gudFix,
      fire: "apply_remedy",
      herbId: "guduchi",
    };
  }

  if (sim.bioavailability_multiplier < 2.0) {
    const ghritaFix = findDirective(sim, "ghee", ["add", "increase"]);
    return {
      gate: "bio",
      label: `Add Ghrita ${ghritaFix?.target_ratio ?? 15.0}% → carrier layer`,
      impact: ghritaFix?.projected_impact,
      directive: ghritaFix ?? { action_type: "add", herb_id: "ghee", target_ratio: 15.0 },
      fire: "apply_remedy",
      herbId: "ghee",
    };
  }

  if (!preFerRun) {
    return { gate: "run_prefer", label: "Run Pre-FER →", fire: "run_prefer" };
  }

  if (fatalDirectives.length > 0) {
    const d = fatalDirectives[0];
    return {
      gate: "apply_remedy",
      label: `Apply remedy: ${d.text || `Reduce ${d.herb_id} to ${d.target_ratio}%`}`,
      impact: d.projected_impact,
      directive: d,
      fire: "apply_remedy",
      herbId: d.herb_id,
    };
  }

  return { gate: "export", label: "Export dossier", fire: "goto_export" };
}

/** §6 verdict line — same ladder, sentence form. Never disagrees with the CTA. */
export function buildVerdictLine(input: GateInput): string {
  const { sim } = input;
  const action = computeNextAction(input);
  const q = sim.medicine_quality_score;

  switch (action.gate) {
    case "empty":
      return `Empty bench — pick a preset or add your first herb to begin.`;
    case "unbalanced":
      return `Quality ${q} — but the batch totals ${sim.total_ratio.toFixed(1)}% w/w, not 100. Normalise before any figure here is meaningful.`;
    case "critical_safety": {
      const crit = criticalWarning(sim)!;
      const target = action.directive?.target_ratio ?? 5.0;
      return `Quality ${q} — ${crit.herb_name.split(" (")[0]} at ${crit.current_dose_percent}% exceeds the ${target}% safe ceiling and ${crit.clinical_manifestation.split(";")[0].toLowerCase()}. Reduce to ${target}%.`;
    }
    case "entity":
      return `Quality ${q} · clears §3(e) — but the entity type is undeclared: foreign entities move the NBA royalty from 3.0% to 5.0% and the filing to Form I.`;
    case "sec3e":
      return `Quality ${q} — but at these ratios the patent office will read this as a mere mixture of known herbs (§3(e)). ${action.directive ? `Applying ${action.directive.herb_id} to ${action.directive.target_ratio}% fixes it` : "Add Pippali above 3% to fix it"}.`;
    case "sec3p":
      return `Quality ${q} — this composition sits at TKDL concordance ${sim.tkdl_concordance_score}, so it is likely already documented traditional knowledge (§3(p)). ${action.impact ? "Add Guduchi to drop below 90." : "Add Guduchi 6% to drop below 90."}`;
    case "bio":
      return `Quality ${q} · legal gates clear — bioavailability is only ${sim.bioavailability_multiplier}x, below the 2.0x the examiner expects for a synergy claim. Add Ghrita for the carrier layer.`;
    case "run_prefer":
        return `Quality ${q} · clears §3(e) · clears §3(p) · royalty ${sim.nba_abs_royalty_percentage.toFixed(1)}% — ready for examination.`;
    case "apply_remedy": {
      const fatal = input.fatalDirectives.length;
      return `Pre-FER found ${fatal} FATAL objection${fatal === 1 ? "" : "s"} — export stays locked until each remedy is applied.`;
    }
    case "export":
      return `Quality ${q} · clears §3(e) · clears §3(p) · royalty ${sim.nba_abs_royalty_percentage.toFixed(1)}% — zero fatal objections, ready for export.`;
  }
}

/** §11.1 — the lens re-orders emphasis but never hides panels. */
export const LENS_ORDER: Record<Lens, string[]> = {
  medicine: ["quality", "synergy", "safety", "composition", "statutory", "economics"],
  law: ["statutory", "quality", "synergy", "safety", "composition", "economics"],
  money: ["economics", "quality", "synergy", "composition", "safety", "statutory"],
};
