import { test } from "node:test";
import assert from "node:assert";

test("Business API: funding / suppliers / label endpoint contracts", async () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";

  const calls: { url: string; options?: RequestInit }[] = [];
  globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
    calls.push({ url: url.toString(), options });
    return {
      ok: true,
      json: async () => ({ matches: [], size_class: "micro", items: [], findings: [] }),
    } as Response;
  }) as typeof fetch;

  try {
    const { matchFunding, fetchSuppliers, checkLabel } = await import("../src/lib/api.ts");

    await matchFunding({
      stage: "new", loan_amount: 800000, project_cost: 800000, turnover: 0,
      sector: "manufacturing", location: "urban", social_category: "general",
      is_woman: false, is_greenfield: true, wants_collateral_free: true, udyam_registered: false,
    });
    assert.ok(calls[0].url.endsWith("/api/business/funding/match"));
    assert.strictEqual(calls[0].options?.method, "POST");
    const body = JSON.parse(calls[0].options?.body as string);
    assert.strictEqual(body.loan_amount, 800000);
    assert.strictEqual(body.sector, "manufacturing");

    await fetchSuppliers({ q: "turmeric", gi_only: true, state: "Kerala" });
    assert.ok(calls[1].url.includes("/api/business/suppliers?"));
    assert.ok(calls[1].url.includes("q=turmeric"));
    assert.ok(calls[1].url.includes("gi_only=true"));
    assert.ok(calls[1].url.includes("state=Kerala"));

    await checkLabel({ draft_text: "Ashwagandha Churna", ruleset: "ayush" });
    assert.ok(calls[2].url.endsWith("/api/business/label/check"));
    assert.strictEqual(calls[2].options?.method, "POST");
    assert.strictEqual(JSON.parse(calls[2].options?.body as string).ruleset, "ayush");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv !== undefined) process.env.NEXT_PUBLIC_API_URL = originalEnv;
    else delete process.env.NEXT_PUBLIC_API_URL;
  }
});
