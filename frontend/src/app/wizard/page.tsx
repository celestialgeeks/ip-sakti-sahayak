"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getWizardState, saveWizardState } from "@/lib/api";
import { SignInModal } from "@/components/auth/SignInModal";
import { STEP_ORDER, StepId, GUIDANCE, STEP_HINTS } from "@/lib/wizard/content";
import {
  useWizardState,
  goToStep,
  markStatus,
  hydrate,
  loadLocal,
  getState,
  setSaveStatus,
  stepComplete,
  isStepUnlocked,
  completedCount,
} from "@/lib/wizard/store";
import { ProgressVisualizer } from "@/components/wizard/ProgressVisualizer";
import {
  EligibilityStep,
  ClassificationStep,
  UdyamStep,
  LicenseStep,
  GmpStep,
  GstStep,
  DossierStep,
} from "@/components/wizard/Steps";

function toServerShape(s: ReturnType<typeof getState>) {
  return {
    current_step: s.currentStep,
    product_type: s.productType,
    classification: s.classification,
    steps: STEP_ORDER.map((id) => ({ id, status: s.statuses[id] })),
    answers: s.answers,
  };
}

function fromServerShape(data: any) {
  const acc: Record<string, string> = {};
  for (const id of STEP_ORDER) acc[id] = "pending";
  const steps: any[] = Array.isArray(data?.steps) ? data.steps : [];
  for (const st of steps) {
    if (st && typeof st.id === "string" && STEP_ORDER.includes(st.id as StepId)) {
      acc[st.id] = st.status;
    }
  }
  return {
    currentStep: (data.current_step as StepId) || "eligibility",
    statuses: acc as Record<StepId, any>,
    productType: data.product_type || "UNKNOWN",
    classification: data.classification || null,
    answers: data.answers || {},
  };
}

export default function WizardPage() {
  const router = useRouter();
  const state = useWizardState();
  const { isAuthenticated } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const skipSave = useRef(true);

  // Hydrate: local first (instant), then server if authenticated.
  useEffect(() => {
    const local = loadLocal();
    if (local) hydrate(local);
    else hydrate({});
    let cancelled = false;
    (async () => {
      if (!isAuthenticated) return;
      try {
        const data = await getWizardState();
        if (!cancelled && data) hydrate(fromServerShape(data));
      } catch {
        /* offline / not authed — local state already applied */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Debounced autosave to the backend for signed-in users.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveWizardState(toServerShape(getState()));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [state, isAuthenticated]);

  const idx = STEP_ORDER.indexOf(state.currentStep);
  const isFirst = idx === 0;
  const isLast = idx === STEP_ORDER.length - 1;
  const complete = stepComplete(state.currentStep, state);
  const guidance = GUIDANCE[state.currentStep];

  const goNext = useCallback(() => {
    if (!complete) return;
    markStatus(state.currentStep, "completed");
    if (!isLast) goToStep(STEP_ORDER[idx + 1]);
  }, [state.currentStep, idx, isLast, complete]);

  const goBack = useCallback(() => {
    if (!isFirst) goToStep(STEP_ORDER[idx - 1]);
  }, [idx, isFirst]);

  const handleJump = useCallback(
    (id: StepId) => {
      if (!isStepUnlocked(id)) return; // sequential gating
      if (!isAuthenticated) setShowSignIn(true);
      goToStep(id);
    },
    [isAuthenticated]
  );

  return (
    <main className="flex-1 bg-[#F4F6F9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Breadcrumb + save chip */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-[12px] font-semibold text-[#0b3c5d] hover:underline">
            ← Back to assistant
          </button>
          <SaveChip authenticated={isAuthenticated} status={state.saveStatus} onSignIn={() => setShowSignIn(true)} />
        </div>

        <ProgressVisualizer onJump={handleJump} />

        {/* Two-column: active step + guidance/summary (responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          <div className="min-w-0">
            {state.currentStep === "eligibility" && <EligibilityStep />}
            {state.currentStep === "classification" && <ClassificationStep />}
            {state.currentStep === "udyam" && <UdyamStep />}
            {state.currentStep === "license" && <LicenseStep goTo={goToStep} />}
            {state.currentStep === "gmp" && <GmpStep />}
            {state.currentStep === "gst" && <GstStep />}
            {state.currentStep === "dossier" && <DossierStep />}

            {/* Footer nav */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={goBack}
                disabled={isFirst}
                className="rounded border border-[#D2D9E2] bg-white px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-[#EEF3F8] disabled:opacity-40"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                {!complete && !isLast ? (
                  <span className="hidden sm:block text-[11.5px] text-[#E65100]">{STEP_HINTS[state.currentStep]}</span>
                ) : null}
                <button
                  onClick={goNext}
                  disabled={!complete}
                  title={complete ? "" : STEP_HINTS[state.currentStep]}
                  className="rounded bg-[#0b3c5d] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#002855] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLast ? "Finish" : "Save & Continue →"}
                </button>
              </div>
            </div>
          </div>

          {/* Sticky guidance / summary rail */}
          <aside className="lg:sticky lg:top-[110px] space-y-4">
            <div className="rounded-lg border border-[#D2D9E2] bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b3c5d]">{guidance.title}</div>
              <ul className="mt-2 space-y-1.5">
                {guidance.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] text-slate-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#138808]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[#D2D9E2] bg-[#EEF3F8] p-4">
              <div className="text-[12px] font-semibold text-[#0b3c5d]">
                {completedCount(state)} of {STEP_ORDER.length} steps complete
              </div>
              <p className="mt-1 text-[11.5px] text-slate-500">
                Complete each step to unlock the next. Your progress saves automatically.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={() => setShowSignIn(false)} />
    </main>
  );
}

function SaveChip({
  authenticated,
  status,
  onSignIn,
}: {
  authenticated: boolean;
  status: "idle" | "saving" | "saved" | "error";
  onSignIn: () => void;
}) {
  if (!authenticated) {
    return (
      <button onClick={onSignIn} className="rounded-full border border-[#E65100] bg-[#FFF3E0] px-3 py-1 text-[11px] font-semibold text-[#9a3412]">
        Sign in to save progress
      </button>
    );
  }
  const text =
    status === "saving" ? "Saving…" : status === "saved" ? "Progress saved" : status === "error" ? "Save failed — retry" : "Synced";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#138808] bg-[#E8F5E9] px-3 py-1 text-[11px] font-semibold text-[#1B5E20]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
      {text}
    </span>
  );
}
