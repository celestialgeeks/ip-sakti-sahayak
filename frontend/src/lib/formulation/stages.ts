// Stage availability for the Formulation Lab's four views (spec §3: doors →
// bench → examine → dossier). Kept separate from gates.ts because it answers a
// different question: gates.ts ranks *what to do next*, this ranks *where the
// user may navigate*. The predicates are the lab's own (spec §12 entry gate,
// §13 export gate) so a stage crumb can never unlock something the CTA says is
// unmet. Pure and deterministic — testable without a DOM.

export type LabStage = "doors" | "bench" | "examine" | "dossier";

/** Ordered progression the stage trail renders. */
export const LAB_STAGES: LabStage[] = ["doors", "bench", "examine", "dossier"];

export const STAGE_LABELS: Record<LabStage, string> = {
  doors: "Start",
  bench: "Bench",
  examine: "Examine",
  dossier: "Dossier",
};

export interface StageAvailability {
  /** Clicking this stage is allowed right now. */
  unlocked: boolean;
  /** The exact unmet gate for the locked crumb. Empty when unlocked. */
  reason: string;
}

export interface StageInput {
  /** Constituents on the bench right now. */
  ingredientCount: number;
  /** Composition sums to 100.0% w/w (§7 rung 2). */
  isBalanced: boolean;
  /** Actual total, for the normalise message. */
  totalRatio: number;
  /** §12 Pre-FER entry gate, as computed by the page. */
  canRunPreFer: boolean;
  /** A Pre-FER report exists this session — current or stale (§13 needs it). */
  preFerSeen: boolean;
  /** A formulation is loaded (preset, custom, or restored draft). */
  onBench: boolean;
}

/**
 * Availability of every stage, keyed by stage. Nothing is ever hidden — a
 * locked stage carries the reason the ladder says is unmet (spec §11.1).
 */
export function computeStageAvailability(input: StageInput): Record<LabStage, StageAvailability> {
  const { canRunPreFer, preFerSeen, onBench } = input;

  return {
    // The doors are always reachable — that is how the starting point changes.
    doors: { unlocked: true, reason: "" },
    bench: { unlocked: onBench, reason: "Choose a starting point first" },
    examine: { unlocked: canRunPreFer, reason: canRunPreFer ? "" : examineBlocker(input) },
    dossier: {
      unlocked: preFerSeen,
      reason: "Run Pre-FER — examination precedes export (§12 → §13)",
    },
  };
}

/** Why §12 still refuses examination, in the order the bench fixes it. */
function examineBlocker(input: StageInput): string {
  if (input.ingredientCount < 3) {
    return "Add at least 3 constituents — the Pre-FER entry gate (§12)";
  }
  if (!input.isBalanced) {
    return `Normalise to 100.0% w/w (now ${input.totalRatio.toFixed(1)}%)`;
  }
  return "";
}

/** Current stage's rank in the progression, 1-based (for screen readers). */
export function stagePosition(stage: LabStage): number {
  return LAB_STAGES.indexOf(stage) + 1;
}
