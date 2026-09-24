import { test } from "node:test";
import assert from "node:assert";
import { simulateClientFormulation } from "../src/lib/formulation/engine.ts";
import { DEFAULT_BOTANICALS, STARTER_PRESETS } from "../src/lib/formulation/defaults.ts";

test("Formulation Lab Suite: Botanicals and Presets Catalog", () => {
  assert.ok(DEFAULT_BOTANICALS.length >= 8, "Expected at least 8 botanical items");
  assert.ok(STARTER_PRESETS.length >= 4, "Expected at least 4 starter presets");

  const ashwa = DEFAULT_BOTANICALS.find((b) => b.id === "ashwagandha");
  assert.ok(ashwa, "Ashwagandha must exist in catalog");
  assert.strictEqual(ashwa.botanical_name, "Withania somnifera");
});

test("Formulation Lab Suite: Synergistic Ratio Simulation (Overcoming Sec 3(e))", () => {
  const ingredients = [
    { herb_id: "ashwagandha", ratio: 40.0 },
    { herb_id: "shilajit", ratio: 10.0 },
    { herb_id: "haridra", ratio: 30.0 },
    { herb_id: "pippali", ratio: 5.0 },
    { herb_id: "ghee", ratio: 15.0 },
  ];

  const result = simulateClientFormulation("High Synergy Benchmark", ingredients, "domestic");

  assert.strictEqual(result.is_balanced, true);
  assert.strictEqual(result.total_ratio, 100.0);
  assert.ok(result.chou_talalay_ci < 0.85, `Expected synergistic CI < 0.85, got ${result.chou_talalay_ci}`);
  assert.strictEqual(result.sec_3e_status, "CLEARED");
  assert.ok(result.ojas_power_score >= 6500, `Expected Ojas score >= 6500, got ${result.ojas_power_score}`);
  assert.ok(["vriddha", "siddha", "divya_rasayana"].includes(result.tier));
  assert.ok(result.bioavailability_multiplier >= 3.0, "Expected bioavailability multiplier >= 3.0x with Pippali + Ghee");
});

test("Formulation Lab Suite: Suboptimal Mere Admixture Detection", () => {
  const suboptimal = [
    { herb_id: "ashwagandha", ratio: 10.0 },
    { herb_id: "shilajit", ratio: 35.0 },
    { herb_id: "haridra", ratio: 25.0 },
    { herb_id: "pippali", ratio: 0.0 },
    { herb_id: "ghee", ratio: 30.0 },
  ];

  const result = simulateClientFormulation("Dilute Admixture", suboptimal, "domestic");

  assert.ok(result.chou_talalay_ci > 1.0, `Expected antagonistic/admixture CI > 1.0, got ${result.chou_talalay_ci}`);
  assert.ok(["BORDERLINE", "REJECTED"].includes(result.sec_3e_status));
  assert.ok(["bala", "kumara"].includes(result.tier));
  assert.ok(result.active_debuffs.some((d) => d.includes("Lacks Yogavāhī")));
  assert.strictEqual(result.nba_abs_royalty_percentage, 5.0, "High mineral Shilajit (35%) triggers 5% levy");
});

test("Formulation Lab Suite: Quality vs Patentability Correlation and Quadrant", () => {
  const balancedSynergistic = [
    { herb_id: "ashwagandha", ratio: 35.0 },
    { herb_id: "haridra", ratio: 35.0 },
    { herb_id: "pippali", ratio: 5.0 },
    { herb_id: "ghee", ratio: 15.0 },
    { herb_id: "guduchi", ratio: 10.0 },
  ];

  const res = simulateClientFormulation("Synergistic Gold", balancedSynergistic, "domestic");

  // Verify Quality & Patentability metrics
  assert.ok(res.medicine_quality_score >= 70, `Expected quality >= 70, got ${res.medicine_quality_score}`);
  assert.ok(res.patentability_scope_score >= 70, `Expected patentability >= 70, got ${res.patentability_scope_score}`);
  assert.strictEqual(res.quadrant, "GOLDEN_SYNERGY");
  assert.strictEqual(res.quadrant_label, "Golden Quadrant (Novel Synergistic Formulation)");

  // Verify Pros and Cons are populated
  assert.ok(res.pros.length >= 2, "Expected at least 2 pros");
  assert.ok(res.pros.some((p) => p.includes("Super-Additive") || p.includes("Synergy")));
});

test("Formulation Lab Suite: Patient Clinical Safety & High-Quantity Toxicological Hazards", () => {
  // Formulation with toxic / excessive Pippali (12%) and Shilajit (25%)
  const hazardousFormula = [
    { herb_id: "ashwagandha", ratio: 20.0 },
    { herb_id: "shilajit", ratio: 25.0 },
    { herb_id: "haridra", ratio: 20.0 },
    { herb_id: "pippali", ratio: 12.0 }, // >8% triggers CRITICAL gastric and CYP3A4 warning
    { herb_id: "ghee", ratio: 23.0 },
  ];

  const res = simulateClientFormulation("Hazard Formula", hazardousFormula, "domestic");

  assert.ok(res.patient_safety_warnings.length >= 2, "Expected safety warnings for excess Pippali and Shilajit");
  assert.strictEqual(res.overall_safety_rating, "HIGH_TOXICITY_RISK");

  const pippaliWarning = res.patient_safety_warnings.find((w) => w.herb_id === "pippali");
  assert.ok(pippaliWarning, "Expected Pippali warning");
  assert.strictEqual(pippaliWarning.severity, "CRITICAL");
  assert.ok(pippaliWarning.hazard.includes("CYP3A4") || pippaliWarning.hazard.includes("Gastric"));
  assert.ok(pippaliWarning.clinical_manifestation.length > 0);

  // Verify "what to remove" identifies reducing Pippali
  assert.ok(
    res.what_to_remove.some((r) => r.herb_id === "pippali"),
    "Expected directive to reduce Pippali"
  );
});

