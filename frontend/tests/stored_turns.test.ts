import { test } from "node:test";
import assert from "node:assert";
import { register } from "node:module";

// `@/` -> `src/`, so the module under test resolves its own imports the way
// Next resolves them. Registered before the dynamic import below, which is what
// needs it.
register(import.meta.resolve("./alias-loader.mjs"));

const { dedupeStoredTurns } = await import("../src/lib/chat.ts");

type Row = { role: "user" | "assistant"; content: string };

const row = (role: Row["role"], content: string): Row => ({ role, content });

/**
 * While both the browser and the backend wrote a turn, a stored session held the
 * question twice and the answer twice, in insertion order. `loadSession` collapses
 * that so history reads the way the conversation actually went.
 */
test("dedupeStoredTurns: collapses the double-write shape", () => {
  const stored = [row("user", "What is TKDL?"), row("user", "What is TKDL?"),
    row("assistant", "The Traditional Knowledge Digital Library."),
    row("assistant", "The Traditional Knowledge Digital Library.")];

  assert.deepStrictEqual(dedupeStoredTurns(stored), [
    row("user", "What is TKDL?"),
    row("assistant", "The Traditional Knowledge Digital Library."),
  ]);
});

test("dedupeStoredTurns: a question genuinely asked twice is kept", () => {
  // Two identical questions separated by an answer are a real repeat, not the
  // double-write, so merging them would erase a turn the user actually took.
  const stored = [row("user", "Again?"), row("assistant", "Sure."),
    row("user", "Again?"), row("assistant", "Still sure.")];

  assert.deepStrictEqual(dedupeStoredTurns(stored), stored);
});

test("dedupeStoredTurns: same text under different roles is never merged", () => {
  const stored = [row("user", "echo"), row("assistant", "echo")];

  assert.deepStrictEqual(dedupeStoredTurns(stored), stored);
});

test("dedupeStoredTurns: only exact adjacent repeats collapse", () => {
  const stored = [row("user", "a"), row("user", "b"), row("user", "b")];

  assert.deepStrictEqual(dedupeStoredTurns(stored), [row("user", "a"), row("user", "b")]);
});

test("dedupeStoredTurns: a clean transcript passes through untouched", () => {
  const stored = [row("user", "q1"), row("assistant", "a1"), row("user", "q2"), row("assistant", "a2")];

  assert.deepStrictEqual(dedupeStoredTurns(stored), stored);
  assert.strictEqual(dedupeStoredTurns([]).length, 0);
});

test("dedupeStoredTurns: extra fields survive the collapse", () => {
  const stored = [
    { role: "assistant" as const, content: "a", citations: [{ source: "Patents Act" }] },
    { role: "assistant" as const, content: "a", citations: [{ source: "Patents Act" }] },
  ];

  const [kept] = dedupeStoredTurns(stored);
  assert.deepStrictEqual(kept.citations, [{ source: "Patents Act" }]);
});
