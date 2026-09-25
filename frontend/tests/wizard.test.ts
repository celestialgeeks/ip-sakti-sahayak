import { test } from "node:test";
import assert from "node:assert";
import {
  WIZARD_STEPS,
  STEP_ORDER,
  TOTAL_STEPS,
  isGoodFit,
  branchForCategory,
  branchFor,
  classifyMsme,
  evaluateGst,
  isStepComplete,
} from "../src/lib/wizard/content.ts";

test("Wizard Suite: exactly 7 ordered steps with stable ids", () => {
  assert.strictEqual(TOTAL_STEPS, 7);
  assert.deepStrictEqual(STEP_ORDER, [
    "eligibility",
    "classification",
    "udyam",
    "license",
    "gmp",
    "gst",
    "dossier",
  ]);
  // GST is modelled as a milestone, not a day-one task.
  const gst = WIZARD_STEPS.find((s) => s.id === "gst");
  assert.ok(gst?.milestone, "GST step should be flagged as a milestone");
});

test("Wizard Suite: eligibility gate returns fit only for commercialization + Ayurvedic", () => {
  assert.strictEqual(isGoodFit("commercialize", true), true);
  assert.strictEqual(isGoodFit("idea", true), false);
  assert.strictEqual(isGoodFit("research", true), false);
  assert.strictEqual(isGoodFit("commercialize", false), false);
  assert.strictEqual(isGoodFit("", true), false);
});

test("Wizard Suite: /classify category maps to the correct licence branch", () => {
  assert.strictEqual(branchForCategory("proprietary"), "AYUSH");
  assert.strictEqual(branchForCategory("classical"), "AYUSH");
  assert.strictEqual(branchForCategory("new_drug"), "AYUSH");
  assert.strictEqual(branchForCategory("phytopharmaceutical"), "AYUSH");
  assert.strictEqual(branchForCategory("ayurveda_aahar"), "FSSAI");
  assert.strictEqual(branchForCategory("cosmetic"), "COSMETIC");
  assert.strictEqual(branchForCategory("unknown"), "UNKNOWN");
  assert.strictEqual(branchForCategory(undefined), "UNKNOWN");
});

test("Wizard Suite: AYUSH and FSSAI branches never overlap", () => {
  const ayush = branchFor("AYUSH");
  const fssai = branchFor("FSSAI");
  assert.ok(ayush.note.includes("FSSAI"), "AYUSH note should clarify FSSAI does not apply");
  assert.ok(
    fssai.note.includes("excludes") || fssai.note.includes("never overlaps"),
    "FSSAI Aahara note should state it excludes drugs / never overlaps"
  );
  // An unknown product defaults to the AYUSH drug path.
  assert.strictEqual(branchFor("UNKNOWN").productType, "AYUSH");
});

test("Wizard Suite: MSME auto-classification (composite of investment + turnover)", () => {
  assert.strictEqual(classifyMsme(20, 100).category, "Micro"); // both low
  assert.strictEqual(classifyMsme(500, 100).category, "Small"); // investment drives Small
  assert.strictEqual(classifyMsme(20, 3000).category, "Small"); // turnover ₹30cr → Small
  assert.strictEqual(classifyMsme(20, 6000).category, "Medium"); // turnover ₹60cr > ₹50cr → Medium
  assert.strictEqual(classifyMsme(2000, 30000).category, "Medium"); // both high
  assert.strictEqual(classifyMsme(0, 0).category, "Unknown");
});

test("Wizard Suite: GST milestone evaluates against the correct threshold", () => {
  assert.strictEqual(evaluateGst(30, "manufacturing").triggered, false); // < 40L goods
  assert.strictEqual(evaluateGst(45, "manufacturing").triggered, true); // >= 40L goods
  assert.strictEqual(evaluateGst(25, "services").triggered, true); // >= 20L services
  assert.strictEqual(evaluateGst(15, "services").triggered, false); // < 20L services
});

test("Wizard Suite: step completion gates forward navigation", () => {
  const empty = { answers: {}, classification: null, productType: "UNKNOWN" as const };
  assert.strictEqual(isStepComplete("eligibility", empty), false);
  assert.strictEqual(
    isStepComplete("eligibility", { ...empty, answers: { stage: "commercialize", isAyurvedic: true } }),
    true
  );
  // Udyam requires all mandatory fields.
  assert.strictEqual(isStepComplete("udyam", empty), false);
  assert.strictEqual(
    isStepComplete("classification", { ...empty, productType: "AYUSH" as const }),
    true
  );
  // GST requires a turnover figure.
  assert.strictEqual(isStepComplete("gst", { ...empty, answers: { gstTurnover: "50" } }), true);
});
