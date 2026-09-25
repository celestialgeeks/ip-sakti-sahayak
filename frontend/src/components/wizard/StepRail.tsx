"use client";

/**
 * SETUP PROGRESS rail shown in the left sidebar while on /wizard, replacing the
 * normal chat navigation (New session / sessions). Reads shared wizard state.
 */
import { WIZARD_STEPS, StepId, StepStatus } from "@/lib/wizard/content";
import { useWizardState, goToStep, progressPercent, completedCount, isStepUnlocked } from "@/lib/wizard/store";
import { ProgressRing } from "./ProgressRing";

function StatusBadge({ status }: { status: StepStatus }) {
  const map: Record<StepStatus, { text: string; cls: string }> = {
    completed: { text: "Done", cls: "text-emerald-400" },
    in_progress: { text: "In progress", cls: "text-amber-300" },
    milestone: { text: "Milestone", cls: "text-slate-400" },
    not_applicable: { text: "N/A", cls: "text-slate-500" },
    pending: { text: "Upcoming", cls: "text-slate-500" },
  };
  const { text, cls } = map[status];
  return <span className={`text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{text}</span>;
}

function StepIcon({ index, status }: { index: number; status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-[11px] font-bold text-slate-300">
      {index}
    </span>
  );
}

export function StepRail() {
  const { currentStep, statuses } = useWizardState();
  const pct = progressPercent();
  const done = completedCount();

  const handleGo = (id: StepId) => goToStep(id);

  return (
    <div className="flex flex-col h-full text-slate-200">
      <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-800">
        <ProgressRing percent={pct} size={44} stroke={5} track="rgba(148,163,184,0.2)" color="#34d399" />
        <div className="leading-tight">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setup progress</div>
          <div className="text-[12px] font-semibold text-slate-200">{done} of {WIZARD_STEPS.length} steps complete</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5" aria-label="Wizard steps">
        {WIZARD_STEPS.map((step) => {
          const status = statuses[step.id];
          const isActive = currentStep === step.id;
          const unlocked = isStepUnlocked(step.id);
          if (!unlocked) {
            return (
              <div
                key={step.id}
                aria-disabled="true"
                title="Complete the previous steps first"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-600 cursor-not-allowed"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-slate-500">{step.navLabel}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Locked</span>
                </span>
              </div>
            );
          }
          return (
            <button
              key={step.id}
              onClick={() => handleGo(step.id)}
              aria-current={isActive ? "step" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors border-l-2 ${
                isActive
                  ? "bg-slate-800 border-[#FF9933] text-white"
                  : "border-transparent hover:bg-slate-800/60 text-slate-300"
              }`}
            >
              <StepIcon index={step.index} status={status} />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-[12.5px] font-medium">{step.navLabel}</span>
                <StatusBadge status={status} />
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-800">
        Progress saves automatically.
      </div>
    </div>
  );
}
