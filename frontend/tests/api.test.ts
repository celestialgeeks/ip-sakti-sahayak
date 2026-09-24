import { test } from "node:test";
import assert from "node:assert";
import { getApiUrl } from "../src/lib/api.ts";

test("API Client: Base URL resolution", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  try {
    // 1. Default local fallback when no env variable is set
    delete process.env.NEXT_PUBLIC_API_URL;
    assert.strictEqual(getApiUrl(), "http://localhost:8000");

    // 2. Custom environment variable without trailing slash
    process.env.NEXT_PUBLIC_API_URL = "https://custom-api.example.com";
    assert.strictEqual(getApiUrl(), "https://custom-api.example.com");

    // 3. Custom environment variable with trailing slash stripped
    process.env.NEXT_PUBLIC_API_URL = "https://custom-api.example.com/";
    assert.strictEqual(getApiUrl(), "https://custom-api.example.com");
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  }
});

test("API Client: Request payload contracts", async () => {
  // Test mock fetch to verify endpoint URL and request body structures
  const originalFetch = globalThis.fetch;
  const calls: { url: string; options?: RequestInit }[] = [];

  globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
    calls.push({ url: url.toString(), options });
    return {
      ok: true,
      json: async () => ({ status: "ok", answer: "Sample response", category: "classical" }),
    } as Response;
  }) as typeof fetch;

  try {
    const { sendChatMessage, classifyFormulation, checkHealth, submitFeedback } = await import(
      "../src/lib/api.ts"
    );

    // Test sendChatMessage
    await sendChatMessage({
      query: "Can I patent Triphala?",
      jurisdiction: "india",
      language: "en",
    });
    assert.strictEqual(calls.length, 1);
    assert.ok(calls[0].url.endsWith("/api/chat"));
    assert.strictEqual(calls[0].options?.method, "POST");
    const chatBody = JSON.parse(calls[0].options?.body as string);
    assert.strictEqual(chatBody.query, "Can I patent Triphala?");
    assert.strictEqual(chatBody.jurisdiction, "india");

    // Test classifyFormulation
    await classifyFormulation({
      formulation_name: "Chyawanprash",
      description: "Classical formulation",
      ingredients: ["Amla"],
      is_in_authoritative_text: true,
      intended_use: "Immunity",
    });
    assert.strictEqual(calls.length, 2);
    assert.ok(calls[1].url.endsWith("/api/classify"));
    const classifyBody = JSON.parse(calls[1].options?.body as string);
    assert.strictEqual(classifyBody.formulation_name, "Chyawanprash");
    assert.strictEqual(classifyBody.is_in_authoritative_text, true);

    // Test checkHealth
    await checkHealth();
    assert.strictEqual(calls.length, 3);
    assert.ok(calls[2].url.endsWith("/api/health"));

    // Test submitFeedback
    await submitFeedback("msg_123", "helpful", "Great source links");
    assert.strictEqual(calls.length, 4);
    assert.ok(calls[3].url.endsWith("/api/feedback"));
    const fbBody = JSON.parse(calls[3].options?.body as string);
    assert.strictEqual(fbBody.message_id, "msg_123");
    assert.strictEqual(fbBody.rating, "helpful");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
