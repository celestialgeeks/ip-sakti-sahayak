import { test } from "node:test";
import assert from "node:assert";
import { createSSEParser, dataOfFrame } from "../src/lib/sse.ts";

/**
 * A wire payload in the exact shape the backend emits:
 * `data: {json}\n\n` per event (rag_pipeline.py `response_to_sse` /
 * `stream_generator`), ending with `data: [DONE]\n\n`.
 */
const ANSWER =
  "## Executive Summary\n\nThe Haridra formulation faces objection under Section 3(p) " +
  "because TKDL accession records anticipate the turmeric combination.\n\n" +
  "### Statutory Position\n\nSection 3(p) excludes traditional knowledge.";

const WIRE =
  `data: ${JSON.stringify({ chunk: ANSWER })}\n\n` +
  `data: ${JSON.stringify({ chunk: " Applicants must show synergy." })}\n\n` +
  `data: ${JSON.stringify({ metadata: { citations: [], confidence: 0.9, confidence_level: "high" } })}\n\n` +
  `data: [DONE]\n\n`;

/** Feed a whole string, then close, and return every data payload received. */
function collect(text: string): string[] {
  const parser = createSSEParser();
  const events = parser.feed(text);
  return [...events, ...parser.end()];
}

/** Cut a string at every interior position and require the same events back. */
function splitEverywhere(text: string): string[][] {
  const out: string[][] = [];
  for (let i = 1; i < text.length; i++) out.push([text.slice(0, i), text.slice(i)]);
  return out;
}

test("sse: a complete stream yields every event in order", () => {
  const events = collect(WIRE);
  assert.strictEqual(events.length, 4);
  assert.strictEqual(events[3], "[DONE]");
  assert.strictEqual(JSON.parse(events[0]).chunk, ANSWER);
  assert.strictEqual(JSON.parse(events[2]).metadata.confidence, 0.9);
});

// The regression this file exists for. The old loop split each read on its own,
// so any event straddling a read boundary was discarded: the first half failed
// JSON.parse and the second no longer began with `data:`. With the translated
// path sending the whole answer as one large event, that blanked the chat.
test("sse: no event is lost at any read boundary", () => {
  const expected = collect(WIRE);
  assert.ok(expected.length > 0, "baseline must produce events");

  for (const pieces of splitEverywhere(WIRE)) {
    const parser = createSSEParser();
    const got: string[] = [];
    for (const piece of pieces) got.push(...parser.feed(piece));
    got.push(...parser.end());
    assert.deepStrictEqual(
      got,
      expected,
      `split at ${pieces[0].length} must not change what arrives`,
    );
  }
});

test("sse: a one-shot answer larger than a read survives whole", () => {
  // 100-byte reads against a several-KB event, the shape that reproduced the bug.
  const wire = `data: ${JSON.stringify({ chunk: ANSWER.repeat(30) })}\n\ndata: [DONE]\n\n`;
  const parser = createSSEParser();
  const payloads: string[] = [];
  for (let offset = 0; offset < wire.length; offset += 100) {
    payloads.push(...parser.feed(wire.slice(offset, offset + 100)));
  }
  payloads.push(...parser.end());

  const text = payloads
    .filter((data) => data !== "[DONE]")
    .map((data) => JSON.parse(data).chunk ?? "")
    .join("");
  assert.strictEqual(text, ANSWER.repeat(30), "answer must not be truncated or dropped");
});

test("sse: bytes split mid-character still decode to intact text", () => {
  const hindi = "रोगी को प्रतिरोपण में सहायता मिलती है।";
  const bytes = new TextEncoder().encode(`data: ${JSON.stringify({ chunk: hindi })}\n\n`);
  const parser = createSSEParser();
  const decoder = new TextDecoder();
  const payloads: string[] = [];
  // Step by 7 bytes: guaranteed to cut inside multi-byte sequences repeatedly.
  for (let offset = 0; offset < bytes.length; offset += 7) {
    payloads.push(...parser.feed(decoder.decode(bytes.slice(offset, offset + 7), { stream: true })));
  }
  payloads.push(...parser.end());
  assert.strictEqual(JSON.parse(payloads[0]).chunk, hindi);
});

test("sse: a stream that closes without [DONE] still delivers its last frame", () => {
  const parser = createSSEParser();
  parser.feed(`data: ${JSON.stringify({ chunk: "kept" })}\n`);
  const tail = parser.end();
  assert.strictEqual(tail.length, 1, "unterminated final frame must survive");
  assert.strictEqual(JSON.parse(tail[0]).chunk, "kept");
});

test("sse: nothing is emitted for a frame that has not terminated yet", () => {
  const parser = createSSEParser();
  assert.deepStrictEqual(parser.feed('data: {"chunk": "par'), [], "half a frame must not leak out");
  assert.deepStrictEqual(parser.feed('tial"}\n\n'), ['{"chunk": "partial"}']);
});

test("sse: CR and CRLF terminators behave, even split across feeds", () => {
  const frame = `data: one\r\n\r\ndata: two\r\n\r\n`;
  assert.deepStrictEqual(collect(frame), ["one", "two"]);
  // Cut between the CR and the LF of the blank line: the pair is one terminator.
  const parser = createSSEParser();
  const got = [...parser.feed("data: one\r"), ...parser.feed("\r\ndata: two\r\n\r\n"), ...parser.end()];
  assert.deepStrictEqual(got, ["one", "two"]);
});

test("sse: field rules — comments and non-data fields ignored, data lines joined", () => {
  assert.strictEqual(dataOfFrame(": keep-alive comment\ndata: payload"), "payload");
  assert.strictEqual(dataOfFrame("event: ping\nid: 7\nretry: 1000"), null);
  assert.strictEqual(dataOfFrame("data: line one\ndata: line two"), "line one\nline two");
  assert.strictEqual(dataOfFrame("data:tight"), "tight", "one optional space removed");
  assert.strictEqual(dataOfFrame("data:  two spaces"), " two spaces", "only one space removed");
  assert.strictEqual(dataOfFrame(""), null, "an empty frame carries nothing");
});

test("sse: parser state resets after end, so a reused parser starts clean", () => {
  const parser = createSSEParser();
  parser.feed("data: first\n");
  assert.deepStrictEqual(parser.end(), ["first"]);
  assert.deepStrictEqual(parser.end(), [], "end is idempotent");
  assert.deepStrictEqual(parser.feed("data: second\n\n"), ["second"]);
});
