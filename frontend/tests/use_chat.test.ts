import { test } from "node:test";
import assert from "node:assert";
import { register } from "node:module";

// Map the Next.js `@/` path alias (used by useChat.ts) to `src/` so Node's
// native TS stripping can load the module under `node --test`.
register(import.meta.resolve("./alias-loader.mjs"));

const { renderToStaticMarkup } = await import("react-dom/server");
const React = await import("react");
const { useChat } = await import("../src/hooks/useChat.ts");

/**
 * Render `useChat` in a throwaway component and capture the returned surface.
 * `renderToStaticMarkup` runs the hook body (useState / useRef / useCallback)
 * but skips effects, so we can assert mount-time behavior deterministically
 * without a DOM or localStorage.
 */
type ChatApi = ReturnType<typeof useChat> & Record<string, unknown>;

function renderHook(initialSessionId?: string): ChatApi {
  const box: { api?: ChatApi } = {};
  function Probe() {
    box.api = useChat(initialSessionId);
    return null;
  }
  renderToStaticMarkup(React.createElement(Probe));
  if (!box.api) {
    throw new Error("useChat did not render");
  }
  return box.api;
}

test("useChat: exposes the documented API surface at mount", () => {
  const api = renderHook();
  assert.ok(api, "hook must return an object");
  assert.ok(Array.isArray(api.messages), "messages must be an array");
  assert.strictEqual(api.messages.length, 0, "messages must start empty");
  assert.strictEqual(api.isLoading, false);
  assert.strictEqual(api.isWaking, false);
  for (const fn of ["send", "clear", "loadSession"]) {
    assert.strictEqual(typeof api[fn], "function", `${fn} must be a function`);
  }
});

test("useChat: seeds sessionId from the initialSessionId argument", () => {
  assert.strictEqual(renderHook("sess-abc").sessionId, "sess-abc");
  // With no argument, sessionId stays undefined until a send / storage restore.
  assert.strictEqual(renderHook().sessionId, undefined);
});
