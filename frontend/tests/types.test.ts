import { test } from "node:test";
import assert from "node:assert";
import type {
  Jurisdiction,
  ConfidenceLevel,
  Language,
  Citation,
  Message,
  ChatResponse,
  ClassifyResponse,
} from "../src/lib/types.ts";

test("Types Suite: Data model integrity", () => {
  // Test Jurisdiction values
  const validJurisdictions: Jurisdiction[] = ["india", "international", "both"];
  assert.strictEqual(validJurisdictions.length, 3);

  // Test ConfidenceLevel values
  const validConfidenceLevels: ConfidenceLevel[] = ["high", "medium", "low"];
  assert.strictEqual(validConfidenceLevels.length, 3);

  // Test Language values
  const validLanguages: Language[] = ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "or", "sa"];
  assert.ok(validLanguages.includes("en"));
  assert.ok(validLanguages.includes("hi"));

  // Verify Citation structure
  const sampleCitation: Citation = {
    id: "cit_1",
    source: "The Patents Act, 1970 (Section 3(p))",
    text: "Section 3(p) excerpt...",
    jurisdiction: "india",
    category: "ip_law",
    confidence_tier: "primary_legislation",
    url: "https://ipindia.gov.in",
  };
  assert.strictEqual(sampleCitation.id, "cit_1");
  assert.strictEqual(sampleCitation.url, "https://ipindia.gov.in");

  // Verify Message structure
  const userMsg: Message = {
    role: "user",
    content: "Is turmeric patentable?",
  };
  const assistantMsg: Message = {
    role: "assistant",
    content: "Turmeric is barred under Section 3(p).",
    citations: [sampleCitation],
    confidence: 0.94,
    confidenceLevel: "high",
    statutoryAlert: {
      title: "Section 3(p) Bar",
      description: "Traditional Knowledge Prior Art",
    },
  };
  assert.strictEqual(userMsg.role, "user");
  assert.strictEqual(assistantMsg.role, "assistant");
  assert.strictEqual(assistantMsg.statutoryAlert?.title, "Section 3(p) Bar");
});
