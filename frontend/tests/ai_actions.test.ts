import { test } from "node:test";
import assert from "node:assert";
import { register } from "node:module";

import type { Message } from "../src/lib/types.ts";
import type { MessageActionsProps } from "../src/components/chat/MessageActions.tsx";

// `@/` -> `src/`, so the modules under test resolve the way Next resolves them.
register(import.meta.resolve("./alias-loader.mjs"));

const {
  copyLabelFor,
  jurisdictionFromParam,
  ratingLabelFor,
  ratingLocked,
  shareLabelFor,
  threadLink,
  userQueryFor,
} = await import("../src/lib/chat.ts");

test("MessageActions: prop contract", () => {
  const props: MessageActionsProps = {
    content: "The preparation is barred under Section 3(p).",
    messageId: "msg-2026-09-29",
    onRetry: () => {},
    disabled: false,
  };

  assert.strictEqual(props.messageId, "msg-2026-09-29");
  assert.strictEqual(typeof props.onRetry, "function");
  assert.strictEqual(props.disabled, false, "an idle row must not start locked");
});

test("userQueryFor: retry replays the question that produced the answer", () => {
  const messages: Message[] = [
    { role: "user", content: "first question" },
    { role: "assistant", content: "first answer" },
    { role: "user", content: "second question" },
    { role: "assistant", content: "second answer" },
  ];

  assert.strictEqual(userQueryFor(messages, 3), "second question");
  assert.strictEqual(userQueryFor(messages, 1), "first question");
  // Nothing above the opening turn, so there is nothing to re-run — and the Retry
  // control is hidden rather than left inert.
  assert.strictEqual(userQueryFor(messages, 0), undefined);

  // A failed send can leave two assistant turns in a row; the older question is
  // still the one behind them, and an empty turn is not a question at all.
  const doubled: Message[] = [
    { role: "user", content: "ask" },
    { role: "assistant", content: "" },
    { role: "assistant", content: "answer" },
  ];
  assert.strictEqual(userQueryFor(doubled, 2), "ask");

  const blankFirst: Message[] = [
    { role: "user", content: "" },
    { role: "assistant", content: "a" },
  ];
  assert.strictEqual(userQueryFor(blankFirst, 1), undefined);
});

test("copyLabelFor / shareLabelFor: a state names itself", () => {
  assert.strictEqual(copyLabelFor("idle"), "Copy answer");
  assert.strictEqual(copyLabelFor("done"), "Copied");
  // A refusal must be readable as a refusal: the label has to change, not just the
  // icon, because the tooltip is the only place the user is told.
  assert.strictEqual(copyLabelFor("failed"), "Copy blocked by browser");

  assert.strictEqual(shareLabelFor("idle"), "Share thread");
  assert.strictEqual(shareLabelFor("done"), "Link copied");
  assert.strictEqual(shareLabelFor("failed"), "Could not copy the link");
});

test("threadLink: the link a thread hands out opens that thread", () => {
  // `?q=` must not travel: a recipient opening it would re-run the question
  // against their own session and see a different transcript than the one sent.
  assert.strictEqual(
    threadLink("http://localhost:3210/chat?session=abc&q=haridra%20novelty"),
    "http://localhost:3210/chat?session=abc",
  );

  // A session restored from storage is still a real thread, so it is named in
  // full rather than shared as a bare /chat that opens an empty canvas.
  assert.strictEqual(
    threadLink("http://localhost:3210/chat", "stored-7"),
    "http://localhost:3210/chat?session=stored-7",
  );

  // No thread behind the link at all: nothing is offered rather than a broken one.
  assert.strictEqual(threadLink("http://localhost:3210/chat"), undefined);
  assert.strictEqual(threadLink("http://localhost:3210/chat", null), undefined);
  assert.strictEqual(threadLink("not a url", "stored-7"), undefined);
});

test("ratingLocked: one rating per turn, then the row closes", () => {
  assert.strictEqual(ratingLocked(null), false);
  assert.strictEqual(ratingLocked("helpful"), true);
  assert.strictEqual(ratingLocked("not_helpful"), true);
});

test("ratingLabelFor: the chosen thumb reports, the other one stops offering", () => {
  assert.strictEqual(ratingLabelFor(null, "helpful"), "Helpful");
  assert.strictEqual(ratingLabelFor(null, "not_helpful"), "Not helpful");
  assert.strictEqual(ratingLabelFor("helpful", "helpful"), "Helpful — recorded");
  assert.strictEqual(ratingLabelFor("helpful", "not_helpful"), "Already recorded");
  assert.strictEqual(ratingLabelFor("not_helpful", "not_helpful"), "Not helpful — recorded");
});

test("jurisdictionFromParam: only a real jurisdiction is accepted", () => {
  assert.strictEqual(jurisdictionFromParam("international"), "international");
  assert.strictEqual(jurisdictionFromParam("india"), "india");
  assert.strictEqual(jurisdictionFromParam("both"), "both");
  // Anything else — including a hand-typed link — falls back to the default
  // instead of reaching the query pipeline.
  assert.strictEqual(jurisdictionFromParam("mars"), undefined);
  assert.strictEqual(jurisdictionFromParam(null), undefined);
  assert.strictEqual(jurisdictionFromParam(""), undefined);
});
