"use client";

/**
 * Lightweight external store for the wizard, shared between the /wizard page
 * (which renders the active step) and the Sidebar step-rail (which renders the
 * SETUP PROGRESS list). Uses useSyncExternalStore so both stay in sync.
 *
 * Progress persists to localStorage immediately (works for anonymous users) and
 * is mirrored to the backend /api/wizard/state for signed-in users.
 */

import { useSyncExternalStore } from "react";
import {
  StepId,
  StepStatus,
  ProductType,
  STEP_ORDER,
  TOTAL_STEPS,
  isStepComplete,
} from "./content";

export interface WizardState {
  currentStep: StepId;
  statuses: Record<StepId, StepStatus>;
  productType: ProductType;
  classification: Record<string, unknown> | null;
  answers: Record<string, unknown>;
  hydrated: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

const STORAGE_KEY = "ipsakti_wizard_state";

function defaultStatuses(): Record<StepId, StepStatus> {
  const s = {} as Record<StepId, StepStatus>;
  for (const id of STEP_ORDER) s[id] = "pending";
  return s;
}

export function initialState(): WizardState {
  return {
    currentStep: "eligibility",
    statuses: defaultStatuses(),
    productType: "UNKNOWN",
    classification: null,
    answers: {},
    hydrated: false,
    saveStatus: "idle",
  };
}

let state: WizardState = initialState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persistLocal() {
  if (typeof window === "undefined") return;
  try {
    const { hydrated, saveStatus, ...serializable } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    /* ignore quota / private mode */
  }
}

function set(next: Partial<WizardState>, persist = true) {
  state = { ...state, ...next };
  if (persist) persistLocal();
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): WizardState {
  return state;
}

function getServerSnapshot(): WizardState {
  // Must be a stable reference across calls during hydration, or React loops.
  return SERVER_SNAPSHOT;
}

const SERVER_SNAPSHOT: WizardState = initialState();

export function useWizardState(): WizardState {
  return useSyncExternalStore(subscribe, getState, getServerSnapshot);
}

// ── Actions ────────────────────────────────────────────────────────

export function goToStep(id: StepId) {
  const statuses = { ...state.statuses };
  if (statuses[id] === "pending") statuses[id] = "in_progress";
  set({ currentStep: id, statuses });
}

export function markStatus(id: StepId, status: StepStatus) {
  set({ statuses: { ...state.statuses, [id]: status } });
}

export function setAnswers(patch: Record<string, unknown>) {
  set({ answers: { ...state.answers, ...patch } });
}

export function setClassification(
  classification: Record<string, unknown> | null,
  productType: ProductType
) {
  set({ classification, productType });
}

export function setSaveStatus(saveStatus: WizardState["saveStatus"]) {
  // saveStatus is transient; don't persist it.
  set({ saveStatus }, false);
}

export function resetWizard() {
  state = initialState();
  persistLocal();
  emit();
}

/** Load from localStorage (client only). Returns merged state. */
export function loadLocal(): Partial<WizardState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      currentStep: parsed.currentStep ?? "eligibility",
      statuses: { ...defaultStatuses(), ...(parsed.statuses || {}) },
      productType: parsed.productType ?? "UNKNOWN",
      classification: parsed.classification ?? null,
      answers: parsed.answers ?? {},
    };
  } catch {
    return null;
  }
}

/** Apply a server/local snapshot into the store, clamping to a valid resume point. */
export function hydrate(patch: Partial<WizardState>) {
  const merged: WizardState = { ...state, ...patch };
  // Resume at the first not-completed step (always unlocked). Never let a stale
  // currentStep point ahead of actual progress into a locked step.
  const firstOpen = STEP_ORDER.find((id) => merged.statuses[id] !== "completed") ?? "dossier";
  const ahead = STEP_ORDER.indexOf(merged.currentStep) > STEP_ORDER.indexOf(firstOpen);
  merged.currentStep = ahead ? firstOpen : merged.currentStep;
  set({ ...merged, hydrated: true });
}

/** Count of completed steps for the progress ring. */
export function completedCount(s: WizardState = state): number {
  return STEP_ORDER.filter((id) => s.statuses[id] === "completed").length;
}

export function progressPercent(s: WizardState = state): number {
  return Math.round((completedCount(s) / TOTAL_STEPS) * 100);
}

/** Whether a step's required data is present (live, not just the completed flag). */
export function stepComplete(id: StepId, s: WizardState = state): boolean {
  return isStepComplete(id, {
    answers: s.answers,
    classification: s.classification,
    productType: s.productType,
  });
}

/**
 * Sequential gating: a step is unlocked only when every earlier step is
 * completed. Step 1 (eligibility) is always unlocked.
 */
export function isStepUnlocked(id: StepId, s: WizardState = state): boolean {
  const idx = STEP_ORDER.indexOf(id);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (s.statuses[STEP_ORDER[i]] !== "completed") return false;
  }
  return true;
}

