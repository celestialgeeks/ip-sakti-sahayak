"use client";

/**
 * Top-of-page progress visualizer: a segmented 7-node stepper plus a circular
 * completion ring, and the current step title. Sits above the active step.
 */
import { WIZARD_STEPS, stepMeta, StepId, StepStatus } from "@/lib/wizard/content";
import { useWizardState, progressPercent, isStepUnlocked } from "@/lib/wizard/store";
import { ProgressRing } from "./ProgressRing";

function nodeColor(status: StepStatus): string {
  if (status === "completed") return "#138808";
  if (status === "in_progress") return "#0b3c5d";
  if (status === "milestone") return "#E65100";
  return "#cbd5e1";
}

export function ProgressVisualizer({ onJump }: { onJump: (id: StepId) => void }) {
  const { currentStep, statuses } = useWizardState();
  const meta = stepMeta(currentStep);
  const pct = progressPercent();

  return (
    <div className="rounded-lg border border-[#D2D9E2] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b3c5d]">
            Step {meta.index} of {WIZARD_STEPS.length}
            {meta.milestone ? " · Milestone" : ""}
          </div>
          <h1 className="truncate font-heading text-lg sm:text-xl font-bold text-[#002855]">{meta.title}</h1>
        </div>
        <ProgressRing percent={pct} size={60} stroke={7} />
      </div>

      {/* Segmented stepper */}
      <ol className="mt-4 flex items-center gap-1" aria-label="Progress">
        {WIZARD_STEPS.map((step, i) => {
          const status = statuses[step.id];
          const active = step.id === currentStep;
          const unlocked = isStepUnlocked(step.id);
          const bar = (
            <span
              className="block h-1.5 w-full rounded-full transition-colors"
              style={{ backgroundColor: unlocked ? nodeColor(status) : "#e2e8f0" }}
            />
          );
          return (
            <li key={step.id} className="flex-1">
              {unlocked ? (
                <button
                  type="button"
                  onClick={() => onJump(step.id)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${step.index}: ${step.navLabel}`}
                  className="group w-full"
                >
                  {bar}
                  <span className={`mt-1.5 hidden truncate text-center text-[10px] sm:block ${active ? "font-bold text-[#0b3c5d]" : "text-slate-500"}`}>
                    {step.index}
                  </span>
                </button>
              ) : (
                <div aria-label={`Step ${step.index}: ${step.navLabel} (locked)`} title="Complete previous steps first">
                  {bar}
                  <span className="mt-1.5 hidden truncate text-center text-[10px] text-slate-300 sm:block">{step.index}</span>
                </div>
              )}
              {i < WIZARD_STEPS.length - 1 ? <span className="sr-only">then</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
