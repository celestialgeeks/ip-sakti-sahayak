/**
 * The decisions a chat turn makes about itself: which question a retry replays,
 * what each control is currently called, and whether a URL parameter is a
 * jurisdiction at all.
 *
 * Kept out of the components on purpose. A `.tsx` file cannot be imported by
 * `node --test` — its TS stripping erases types but does not transform JSX — so
 * anything asserted here is a plain function, and the components only render the
 * answer rather than each computing their own.
 */

import type { Jurisdiction, Message } from "@/lib/types";
import { JURISDICTIONS } from "@/lib/constants";

/**
 * A jurisdiction read out of a URL, or nothing.
 *
 * The composer's choice is echoed into `?j=` so a shared link re-asks in the same
 * legal frame. Casting that param straight to `Jurisdiction` would forward any
 * string a link author types into the query pipeline; this checks it against the
 * same list the picker renders, so the two can never drift.
 */
export function jurisdictionFromParam(value: string | null | undefined): Jurisdiction | undefined {
  return (JURISDICTIONS.map((j) => j.value) as string[]).includes(value ?? "")
    ? (value as Jurisdiction)
    : undefined;
}

/** Transient result of a clipboard write. */
export type ActionFeedback = "idle" | "done" | "failed";

/** The rating filed against one answer. `null` is "not recorded yet". */
export type Rating = "helpful" | "not_helpful" | null;

/**
 * The question an answer was produced from: the nearest user turn above it.
 *
 * Walks backwards rather than assuming a strict alternating pair because a send
 * that errored can leave two assistant turns in a row, and retrying the second
 * must replay the question that actually generated it. An empty user turn is not
 * a question, so it is skipped rather than replayed as a blank query.
 */
export function userQueryFor(messages: Message[], index: number): string | undefined {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user" && messages[i].content) return messages[i].content;
  }
  return undefined;
}

/**
 * Copy is a read, so it never changes the transcript — but it can be refused, and
 * a refusal that dismisses itself looks exactly like a copy that worked. The
 * failed label therefore stays until the next attempt.
 */
export function copyLabelFor(state: ActionFeedback): string {
  if (state === "done") return "Copied";
  if (state === "failed") return "Copy blocked by browser";
  return "Copy answer";
}

/**
 * Share publishes the thread permalink, not the single answer: an excerpt torn
 * out of a legal conversation travels without the caveats attached to it.
 *
 * The generic failure label is deliberate — the two ways this fails (the browser
 * refused the write, or there is no thread to point at yet) both end the same way
 * for the user, and guessing which one happened would be a claim, not a fact.
 */
export function shareLabelFor(state: ActionFeedback): string {
  if (state === "done") return "Link copied";
  if (state === "failed") return "Could not copy the link";
  return "Share thread";
}

/**
 * The permalink for the conversation the user is looking at.
 *
 * `?q=` is stripped on purpose: a recipient opening a link that still carries the
 * question would re-run it against their own session and be shown a different
 * transcript than the one they were sent. A link is only produced once a session
 * exists — either in the URL or in the storage the hook writes it to — because a
 * `/chat` link with no thread behind it promises a conversation it cannot open.
 */
export function threadLink(href: string, storedSessionId?: string | null): string | undefined {
  try {
    const url = new URL(href);
    if (!url.searchParams.get("session")) {
      if (!storedSessionId) return undefined;
      url.searchParams.set("session", storedSessionId);
    }
    url.searchParams.delete("q");
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * `/api/feedback` appends a row and offers no retraction, so once a rating lands
 * the control locks and says it did. Undo would file a second, contradictory
 * rating while implying the first had been withdrawn.
 */
export function ratingLocked(rating: Rating): boolean {
  return rating !== null;
}

/** The label a thumbs control carries, before and after it is recorded. */
export function ratingLabelFor(rating: Rating, value: "helpful" | "not_helpful"): string {
  if (rating === value) return `${value === "helpful" ? "Helpful" : "Not helpful"} — recorded`;
  return rating === null ? (value === "helpful" ? "Helpful" : "Not helpful") : "Already recorded";
}
