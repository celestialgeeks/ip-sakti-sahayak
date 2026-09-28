/**
 * Reasoning log for the chat stream — the single model behind the "thinking" UI.
 *
 * The thinking phase used to be a fixed block of invented copy that scrolled
 * forever, so it lied twice: it described work the pipeline was not necessarily
 * doing, and it stayed on screen while the answer was already streaming. Every
 * step recorded here is a milestone the client genuinely observes (request sent,
 * stream open, first token, grounding verified, complete) with a measured
 * duration, so the UI can switch off the moment content arrives and still be
 * readable after the answer finishes.
 *
 * Kept dependency-free and immutable so the hook, the components, and
 * `node --test` all read the same truth.
 */

import type { Citation } from "@/lib/types";

/** Lifecycle of one streamed answer. `waiting` is the only thinking phase. */
export type ChatPhase = "idle" | "waiting" | "answering" | "done" | "error";

export interface ReasoningStep {
  id: string;
  /** What actually happened, in plain words — never a generic "Processing". */
  label: string;
  /** Measured facts attached to the milestone (timing, counts, error text). */
  detail?: string;
  /** Wall-clock ms when the milestone landed. */
  at: number;
  /** Gap from the previous milestone, in ms. */
  ms?: number;
  /** `server` marks a stage the backend reported itself; `client` is measured here. */
  origin: "client" | "server";
}

export interface Grounding {
  passages: number;
  /** Distinct corpora the cited passages came from. */
  corpora: string[];
  confidence?: number;
  confidenceLevel?: string;
  statutoryAlert: boolean;
}

export interface ReasoningTracker {
  phase: ChatPhase;
  startedAt: number;
  connectedAt?: number;
  firstTokenAt?: number;
  endedAt?: number;
  chunks: number;
  characters: number;
  steps: ReasoningStep[];
  grounding?: Grounding;
  /** Chain-of-thought text the model leaked into the stream, salvaged not deleted. */
  modelThinking?: string;
}

/** The snapshot stored on an assistant message so the trace outlives the stream. */
export interface ReasoningRecord {
  startedAt: number;
  /** Time between sending the query and the first content chunk. */
  thinkingMs: number;
  summary: string;
  steps: ReasoningStep[];
  modelThinking?: string;
}

/** Shape of the `metadata` SSE event, tolerant of missing fields. */
export interface StreamMetadataEvent {
  citations?: Citation[];
  confidence?: number;
  confidence_level?: string;
  statutory_alert?: { title?: string; description?: string } | null;
  session_id?: string;
}

/**
 * Format a duration the way a status line reads: 340ms, 4.2s, 1m 12s.
 */
export function formatDuration(ms: number): string {
  const safe = Math.max(0, Math.round(ms));
  if (safe < 1000) return `${safe}ms`;
  const seconds = safe / 1000;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1).replace(/\.0$/, "") : Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds - minutes * 60)}s`;
}

/** `access_benefit_sharing` → `Access benefit sharing`, for a corpus chip label. */
export function humanizeCorpus(raw: string): string {
  const words = raw.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function pushStep(
  tracker: ReasoningTracker,
  step: Omit<ReasoningStep, "ms" | "origin"> & { origin?: ReasoningStep["origin"] },
): ReasoningTracker {
  if (tracker.steps.some((existing) => existing.id === step.id)) return tracker;
  const previous = tracker.steps[tracker.steps.length - 1];
  const next: ReasoningStep = {
    ...step,
    origin: step.origin ?? "client",
    ms: previous ? Math.max(0, step.at - previous.at) : 0,
  };
  return { ...tracker, steps: [...tracker.steps, next] };
}

/**
 * Open a log for a query that is about to leave the browser.
 *
 * The request facts are the ones actually being sent, so the first line of the
 * trace is a fact rather than a forecast of what the pipeline might do.
 */
export function startReasoning(
  now: number,
  request: { jurisdiction: string; language: string },
): ReasoningTracker {
  return {
    phase: "waiting",
    startedAt: now,
    chunks: 0,
    characters: 0,
    steps: [
      {
        id: "sent",
        label: "Query submitted",
        detail: `jurisdiction ${request.jurisdiction} · language ${request.language}`,
        at: now,
        ms: 0,
        origin: "client",
      },
    ],
  };
}

/** HTTP response headers arrived — everything before this is backend queue + retrieval. */
export function openStream(tracker: ReasoningTracker, now: number, status: number): ReasoningTracker {
  return pushStep(
    { ...tracker, connectedAt: now },
    {
      id: "stream-open",
      label: status === 200 ? "Retrieval stream open" : `Backend responded ${status}`,
      detail: `first byte after ${formatDuration(now - tracker.startedAt)}`,
      at: now,
    },
  );
}

/**
 * Mark the cold-start assumption after the caller has waited long enough to
 * suspect it. Hedges with "likely" because the client cannot see the cause.
 */
export function noteSlowStart(tracker: ReasoningTracker, now: number, waitedMs: number): ReasoningTracker {
  return pushStep(tracker, {
    id: "slow-start",
    label: "Still waiting on the backend",
    detail: `no bytes after ${formatDuration(waitedMs)} — cold start likely`,
    at: now,
  });
}

/**
 * Record a content chunk. Only the first one changes the phase: that instant is
 * exactly when the thinking indicator must stop being visible.
 */
export function receiveChunk(tracker: ReasoningTracker, now: number, text: string): ReasoningTracker {
  const counted: ReasoningTracker = {
    ...tracker,
    chunks: tracker.chunks + 1,
    characters: tracker.characters + text.length,
  };
  if (counted.phase !== "waiting") return counted;

  return pushStep(
    { ...counted, phase: "answering", firstTokenAt: now },
    {
      id: "first-token",
      label: "First content chunk received",
      detail: `reasoned for ${formatDuration(now - tracker.startedAt)}`,
      at: now,
    },
  );
}

/** A stage the backend reported over SSE — shown with `server` provenance, never invented. */
export function addServerStage(
  tracker: ReasoningTracker,
  stage: { label: string; detail?: string },
  now: number,
): ReasoningTracker {
  const id = `server-${tracker.steps.filter((s) => s.origin === "server").length + 1}`;
  return pushStep(tracker, {
    id,
    label: stage.label,
    detail: stage.detail,
    at: now,
    origin: "server",
  });
}

/**
 * Keep the model's own planning text instead of silently throwing it away.
 *
 * Extraction runs against the accumulated raw stream, so the newest call always
 * holds the fullest version of the preamble — set it, never append.
 */
export function recordModelThinking(tracker: ReasoningTracker, text: string): ReasoningTracker {
  const cleaned = text.trim();
  if (!cleaned || cleaned === tracker.modelThinking) return tracker;
  const withText: ReasoningTracker = { ...tracker, modelThinking: cleaned };
  if (tracker.steps.some((s) => s.id === "model-thinking")) return withText;
  return pushStep(withText, {
    id: "model-thinking",
    label: "Model reasoning draft",
    detail: "chain-of-thought text stripped from the answer",
    at: tracker.firstTokenAt ?? tracker.startedAt,
  });
}

const THINKING_MARKER = "Here's a thinking process:";

/**
 * Pull the chain-of-thought out of a raw stream buffer: a `<think>` block, or the
 * planning preamble that ends where the answer heading begins. Empty string when
 * the model went straight to the answer — nothing is invented to fill the panel.
 */
export function extractModelThinking(raw: string): string {
  const closed = /<think>([\s\S]*?)<\/think>/i.exec(raw);
  if (closed) return closed[1].trim();
  const opened = /<think>([\s\S]*)$/i.exec(raw);
  if (opened) return opened[1].trim();

  const marker = raw.indexOf(THINKING_MARKER);
  if (marker === -1) return "";
  const after = raw.slice(marker + THINKING_MARKER.length);
  const boundary = after.search(/\n\n(?:###\s+|[A-Z][a-z]+\b|\d+\.\s+\*\*)/);
  return (boundary === -1 ? after : after.slice(0, boundary)).trim();
}

/** Turn the metadata event into a grounding summary, ignoring anything absent. */
export function deriveGrounding(metadata?: StreamMetadataEvent | null): Grounding | undefined {
  if (!metadata) return undefined;
  const citations = Array.isArray(metadata.citations) ? metadata.citations : [];
  const corpora = Array.from(
    new Set(
      citations
        .map((citation) => humanizeCorpus(citation?.category || citation?.source || ""))
        .filter(Boolean),
    ),
  );
  return {
    passages: citations.length,
    corpora,
    confidence: typeof metadata.confidence === "number" ? metadata.confidence : undefined,
    confidenceLevel: metadata.confidence_level,
    statutoryAlert: Boolean(metadata.statutory_alert),
  };
}

/** Citations, confidence and alerts have been verified by the pipeline. */
export function applyGrounding(
  tracker: ReasoningTracker,
  metadata: StreamMetadataEvent,
  now: number,
): ReasoningTracker {
  const grounding = deriveGrounding(metadata);
  const detail = grounding
    ? [
        grounding.passages
          ? `${grounding.passages} cited ${grounding.passages === 1 ? "passage" : "passages"}${
              grounding.corpora.length ? ` across ${grounding.corpora.length} ${grounding.corpora.length === 1 ? "corpus" : "corpora"}` : ""
            }`
          : "no citations returned",
        typeof grounding.confidence === "number"
          ? `confidence ${grounding.confidence.toFixed(2)} (${grounding.confidenceLevel ?? "ungraded"})`
          : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "no grounding reported";

  const next = pushStep(
    { ...tracker, grounding },
    { id: "grounding", label: "Grounding verified", detail, at: now },
  );
  if (!grounding?.statutoryAlert) return next;
  return pushStep(next, {
    id: "statutory-alert",
    label: "Statutory overlap flagged",
    detail: metadata.statutory_alert?.title ?? "Section 3(p) / TKDL prior art",
    at: now,
  });
}

/** Stream ended cleanly. */
export function finishReasoning(tracker: ReasoningTracker, now: number): ReasoningTracker {
  const draftSpan = tracker.firstTokenAt ? now - tracker.firstTokenAt : now - tracker.startedAt;
  const detail =
    tracker.chunks <= 1
      ? `${tracker.characters} chars delivered in one block (translated or non-streamed path)`
      : `${tracker.characters} chars across ${tracker.chunks} chunks in ${formatDuration(draftSpan)}`;
  return pushStep({ ...tracker, phase: "done", endedAt: now }, {
    id: "complete",
    label: "Answer complete",
    detail,
    at: now,
  });
}

/** Stream failed — the honest terminal step, with the real error text. */
export function failReasoning(tracker: ReasoningTracker, now: number, message: string): ReasoningTracker {
  return pushStep({ ...tracker, phase: "error", endedAt: now }, {
    id: "error",
    label: "Stream failed",
    detail: message,
    at: now,
  });
}

/** How long the backend spent before the first content chunk. */
export function thinkingSpan(tracker: ReasoningTracker, now = Date.now()): number {
  if (tracker.firstTokenAt) return tracker.firstTokenAt - tracker.startedAt;
  return (tracker.endedAt ?? now) - tracker.startedAt;
}

/** True only while the request is in flight with no content yet — the sole legal moment for a spinner. */
export function isThinking(tracker: ReasoningTracker | null): boolean {
  return tracker?.phase === "waiting";
}

/**
 * One-line recap for the collapsed header, ChatGPT/Claude style: the wait is
 * stated up front, the grounding follows once it is known.
 */
export function summarize(tracker: ReasoningTracker, now = Date.now()): string {
  if (tracker.phase === "waiting") return `Reasoning for ${formatDuration(now - tracker.startedAt)}`;

  const parts = [`Thought for ${formatDuration(thinkingSpan(tracker))}`];
  if (tracker.phase === "answering") {
    parts.push(`drafting — ${tracker.characters} chars so far`);
    return parts.join(" · ");
  }
  if (tracker.grounding) {
    parts.push(
      tracker.grounding.passages
        ? `${tracker.grounding.passages} passages · ${tracker.grounding.corpora.length} corpora`
        : "no citations returned",
    );
  }
  if (tracker.phase === "error") parts.push("stream failed");
  return parts.join(" · ");
}

/** Freeze the tracker into the shape that is stored on the message. */
export function toRecord(tracker: ReasoningTracker, now = Date.now()): ReasoningRecord {
  return {
    startedAt: tracker.startedAt,
    thinkingMs: thinkingSpan(tracker, now),
    summary: summarize(tracker, now),
    steps: tracker.steps,
    modelThinking: tracker.modelThinking,
  };
}

/** Split salvaged chain-of-thought into display sentences, dropping list markers. */
function splitThinking(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((para) => para.match(/[^.!?]+[.!?]*/g) || [])
    .map((sentence) =>
      sentence
        .replace(/^\s*(?:[-*]|\d+\.)\s+/, "")
        .replace(/^#+\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((sentence) => sentence.length > 2);
}

/**
 * The reasoning lines shown by the animated thinking panel.
 *
 * Prefers the model's own salvaged chain-of-thought. When the model went
 * straight to the answer (or the backend stripped the preamble before it
 * reached the client) it falls back to a plain-language rendering of the
 * milestones that genuinely happened — one line per real step, so the panel
 * abstracts the technical log without ever inventing work that was not done.
 */
export function thinkingLines(record: ReasoningRecord): string[] {
  const model = (record.modelThinking || "").trim();
  if (model) {
    const fromModel = splitThinking(model);
    if (fromModel.length) return fromModel;
  }

  const ids = new Set(record.steps.map((step) => step.id));
  const lines: string[] = [];
  if (ids.has("sent"))
    lines.push("Reading the question and framing it against the applicable Indian IP and Ayush rules.");
  if (ids.has("stream-open") || ids.has("first-token"))
    lines.push("Retrieving the governing passages from the corpus and ranking them by relevance.");
  if (ids.has("statutory-alert"))
    lines.push("Checking the retrieved passages for a Section 3(p) / TKDL prior-art overlap.");
  if (ids.has("grounding"))
    lines.push("Grading confidence against the strength of the sources that came back.");
  if (ids.has("model-thinking"))
    lines.push("Drafting the response and tying each claim back to a citation.");
  if (!lines.length)
    lines.push("Working through the question against the source corpus.");
  return lines;
}
