import { test } from "node:test";
import assert from "node:assert";
import type { Citation } from "../src/lib/types.ts";
import {
  addServerStage,
  applyGrounding,
  deriveGrounding,
  extractModelThinking,
  failReasoning,
  finishReasoning,
  formatDuration,
  isThinking,
  noteSlowStart,
  openStream,
  receiveChunk,
  recordModelThinking,
  startReasoning,
  summarize,
  thinkingSpan,
  toRecord,
  type ReasoningTracker,
} from "../src/lib/reasoning.ts";

const T0 = 1_000_000;

function started(): ReasoningTracker {
  return startReasoning(T0, { jurisdiction: "india", language: "en" });
}

function cited(category: string, source: string): Citation {
  return { category, confidence_tier: "high", id: source, jurisdiction: "india", source, text: "" };
}

/** Drive a realistic stream: headers, two chunks, metadata, clean end. */
function completed(): ReasoningTracker {
  let tracker = started();
  tracker = openStream(tracker, T0 + 900, 200);
  tracker = receiveChunk(tracker, T0 + 4200, "Section 3(p) bars ");
  tracker = receiveChunk(tracker, T0 + 5100, "traditional knowledge.");
  tracker = applyGrounding(
    tracker,
    {
      citations: [
        cited("patent_act", "The Patents Act, 1970"),
        cited("tkdl", "TKDL"),
        cited("patent_act", "Rule 12"),
      ],
      confidence: 0.87,
      confidence_level: "high",
      statutory_alert: null,
    },
    T0 + 5300,
  );
  return finishReasoning(tracker, T0 + 5400);
}

test("formatDuration scales from milliseconds to minutes", () => {
  assert.strictEqual(formatDuration(340), "340ms");
  assert.strictEqual(formatDuration(4200), "4.2s");
  assert.strictEqual(formatDuration(10_500), "11s");
  assert.strictEqual(formatDuration(75_000), "1m 15s");
  assert.strictEqual(formatDuration(-8), "0ms", "never a negative duration");
});

test("the thinking state is visible only until the first content chunk", () => {
  let tracker = started();
  assert.strictEqual(isThinking(tracker), true);
  assert.strictEqual(tracker.phase, "waiting");

  // Response headers are not an answer: still thinking.
  tracker = openStream(tracker, T0 + 900, 200);
  assert.strictEqual(isThinking(tracker), true);

  // First content chunk — the indicator must be gone from this instant.
  tracker = receiveChunk(tracker, T0 + 4200, "Section");
  assert.strictEqual(isThinking(tracker), false);
  assert.strictEqual(tracker.phase, "answering");

  // And it never comes back for the rest of the stream.
  tracker = receiveChunk(tracker, T0 + 4400, " 3(p)");
  assert.strictEqual(isThinking(tracker), false);
  assert.strictEqual(tracker.chunks, 2, "every chunk is counted");
  assert.strictEqual(
    tracker.steps.filter((step) => step.id === "first-token").length,
    1,
    "the milestone is recorded exactly once",
  );
});

test("steps are recorded in arrival order with measured gaps", () => {
  const tracker = completed();
  assert.deepStrictEqual(
    tracker.steps.map((step) => step.id),
    ["sent", "stream-open", "first-token", "grounding", "complete"],
  );
  assert.strictEqual(tracker.steps[1].ms, 900, "TTFB is measured from the send");
  assert.strictEqual(tracker.steps[2].ms, 3300, "the retrieval wait is isolated");
  assert.ok(
    tracker.steps.every((step) => typeof step.ms === "number" && step.ms >= 0),
    "no step may be silent about how long it took",
  );
  assert.strictEqual(thinkingSpan(tracker), 4200);
});

test("the recap states the wait and the grounding, not a bare status", () => {
  const tracker = completed();
  assert.strictEqual(
    summarize(tracker),
    "Thought for 4.2s · 3 passages · 2 corpora",
  );
  assert.match(toRecord(tracker).summary, /^Thought for 4\.2s/);
});

test("the recap changes with the phase instead of freezing", () => {
  assert.match(summarize(started(), T0 + 700), /^Reasoning for 700ms$/);

  const drafting = receiveChunk(openStream(started(), T0 + 900, 200), T0 + 4200, "Section 3(p)");
  assert.strictEqual(drafting.phase, "answering");
  assert.match(summarize(drafting), /drafting — 12 chars so far/);
});

test("grounding is derived from the citations that actually arrived", () => {
  const grounding = deriveGrounding({
    citations: [
      cited("access_benefit_sharing", "ABS Guidelines"),
      cited("tkdl", "TKDL"),
      cited("tkdl", "TKDL again"),
    ],
    confidence: 0.62,
    confidence_level: "medium",
  });

  assert.strictEqual(grounding?.passages, 3);
  assert.deepStrictEqual(grounding?.corpora, ["Access benefit sharing", "Tkdl"]);
  assert.strictEqual(grounding?.confidence, 0.62);
  assert.strictEqual(grounding?.statutoryAlert, false);
});

test("an absent metadata payload is reported as ungrounded, never invented", () => {
  assert.strictEqual(deriveGrounding(undefined), undefined);

  let tracker = receiveChunk(started(), T0 + 1000, "Answer");
  tracker = applyGrounding(tracker, { citations: [], confidence: 0.2, confidence_level: "low" }, T0 + 1100);
  tracker = finishReasoning(tracker, T0 + 1200);

  assert.strictEqual(tracker.grounding?.passages, 0);
  assert.match(summarize(tracker), /no citations returned/);
});

test("a statutory alert surfaces as its own step", () => {
  const tracker = applyGrounding(
    receiveChunk(started(), T0 + 1000, "Answer"),
    {
      citations: [],
      statutory_alert: { title: "Statutory Alert: Section 3(p) / TKDL Prior Art Detected" },
    },
    T0 + 1100,
  );
  const alert = tracker.steps.find((step) => step.id === "statutory-alert");
  assert.ok(alert, "the alert must be reviewable in the log");
  assert.match(alert?.detail ?? "", /Section 3\(p\)/);
});

test("a slow start is stated as an assumption, and only stated once", () => {
  let tracker = noteSlowStart(started(), T0 + 25_000, 25_000);
  tracker = noteSlowStart(tracker, T0 + 26_000, 26_000);

  const slow = tracker.steps.filter((step) => step.id === "slow-start");
  assert.strictEqual(slow.length, 1);
  assert.match(slow[0].detail ?? "", /cold start likely/, "the cause is not knowable client-side");
});

test("one-block deliveries are labelled as such because they are not token streams", () => {
  let tracker = receiveChunk(started(), T0 + 6000, "A translated answer arrives whole.");
  tracker = finishReasoning(tracker, T0 + 6100);
  const complete = tracker.steps.find((step) => step.id === "complete");
  assert.match(complete?.detail ?? "", /one block/);
});

test("backend-reported stages keep their own provenance", () => {
  let tracker = addServerStage(started(), { detail: "10 hits", label: "Searched 7 corpora" }, T0 + 300);
  tracker = addServerStage(tracker, { label: "Reranking passages" }, T0 + 400);

  const server = tracker.steps.filter((step) => step.origin === "server");
  assert.deepStrictEqual(server.map((step) => step.id), ["server-1", "server-2"]);
  assert.strictEqual(server[0].detail, "10 hits");
  assert.strictEqual(
    tracker.steps.filter((step) => step.origin === "client").length,
    1,
    "local milestones are not relabelled",
  );
});

test("chain-of-thought text is extracted from the raw stream when present", () => {
  const withBlock = extractModelThinking("<think>Check 3(p) first.</think>\n\n### Answer");
  assert.strictEqual(withBlock, "Check 3(p) first.");

  const openBlock = extractModelThinking("<think>Still planning the response");
  assert.strictEqual(openBlock, "Still planning the response");

  const preamble = extractModelThinking(
    "Here's a thinking process:\n1. **Analyze User Request:** the query concerns turmeric.\n\n### Executive Summary\nThe answer.",
  );
  assert.match(preamble, /Analyze User Request/);
  assert.doesNotMatch(preamble, /Executive Summary/, "the answer must not leak into the log");

  assert.strictEqual(extractModelThinking("### Executive Summary\nThe answer."), "");
});

test("a salvaged draft is shown, replaced as it grows, and never duplicated", () => {
  let tracker = recordModelThinking(started(), "Step one.");
  tracker = recordModelThinking(tracker, "Step one. Step two.");

  assert.strictEqual(tracker.modelThinking, "Step one. Step two.");
  assert.strictEqual(tracker.steps.filter((step) => step.id === "model-thinking").length, 1);

  // Nothing to show when the model went straight to the answer.
  assert.strictEqual(recordModelThinking(started(), "").modelThinking, undefined);
});

test("a failed stream records where it stopped and why", () => {
  const tracker = failReasoning(openStream(started(), T0 + 900, 200), T0 + 30_000, "Chat API error: Status 500");

  assert.strictEqual(tracker.phase, "error");
  assert.strictEqual(isThinking(tracker), false, "an error must not leave a spinner behind");
  const failure = tracker.steps.find((step) => step.id === "error");
  assert.strictEqual(failure?.detail, "Chat API error: Status 500");
  assert.match(summarize(tracker), /stream failed/);
});

test("the stored record survives a localStorage round-trip", () => {
  const record = toRecord(completed());
  const revived = JSON.parse(JSON.stringify(record));

  assert.strictEqual(revived.thinkingMs, 4200);
  assert.strictEqual(revived.summary, record.summary);
  assert.deepStrictEqual(
    revived.steps.map((step: { label: string }) => step.label),
    record.steps.map((step) => step.label),
  );
});
