/**
 * Incremental Server-Sent-Events reader.
 *
 * `fetch` hands the body back in whatever pieces the socket and any proxies in
 * front of it happen to deliver. A single `reader.read()` can therefore end in
 * the middle of an event, and the next one starts in the middle of the same
 * event. Splitting each read on its own — `text.split("\n\n")` — silently
 * destroys every event that straddles a boundary: the first half fails
 * `JSON.parse`, the second half no longer starts with `data:`, and both are
 * dropped. A one-shot answer (the translated path, or a long reply sent as a
 * single large event) arrives as one event, so the whole reply can vanish and
 * the UI renders nothing after the thinking animation.
 *
 * This keeps the bytes that do not yet form a complete event and hands them to
 * the next feed, so boundaries stop being lossy.
 *
 * Dependency-free and stateful-per-instance, so the hook, the components, and
 * `node --test` all read the same truth.
 */

/** The payload of one SSE frame — the text after `data:`, without the prefix. */
export type SSEData = string;

export interface SSEParser {
  /**
   * Push decoded stream text and collect every frame it completed.
   * Frames still arriving are held internally, never emitted half-read.
   */
  feed(text: string): SSEData[];
  /**
   * End of stream: emit a final frame the server terminated without a blank
   * line, then reset. Safe to call more than once.
   */
  end(): SSEData[];
}

/** Strip a trailing CR from this feed and hold it until the next byte is known. */
function splitLineEndings(text: string, final: boolean): { text: string; carry: string } {
  if (!final && text.endsWith("\r")) {
    // A "\r\n" pair can straddle two reads; treated as one terminator, not two,
    // otherwise the pair would fabricate a blank line and split an event.
    return { text: text.slice(0, -1), carry: "\r" };
  }
  return { text, carry: "" };
}

/**
 * Read the `data` field out of one frame.
 *
 * Follows the SSE field rules: only `data` contributes, one optional leading
 * space is removed, several `data` lines join with newlines, and comments
 * (`: ...`) or unrelated fields (`event:`, `id:`, `retry:`) are ignored.
 * Returns null for a frame that carried no data, so the caller skips it.
 */
export function dataOfFrame(frame: string): SSEData | null {
  const collected: string[] = [];
  for (const line of frame.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const value = line.slice(5);
    collected.push(value.startsWith(" ") ? value.slice(1) : value);
  }
  if (collected.length === 0) return null;
  return collected.join("\n");
}

export function createSSEParser(): SSEParser {
  let buffer = "";
  let carry = "";

  const drain = (text: string, final: boolean): SSEData[] => {
    const adjusted = splitLineEndings(carry + text, final);
    carry = adjusted.carry;
    buffer += adjusted.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const frames: SSEData[] = [];
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      frames.push(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }

    // The stream is over: whatever is left can never be completed by a future
    // feed, so treat it as the last frame instead of discarding it.
    if (final && buffer.length > 0) {
      frames.push(buffer);
      buffer = "";
    }

    return frames.map(dataOfFrame).filter((data): data is string => data !== null);
  };

  return {
    feed(text: string) {
      return drain(text, false);
    },
    end() {
      return drain("", true);
    },
  };
}

/** The transport's own end-of-stream marker, distinct from a real payload. */
export const SSE_DONE = "[DONE]";
