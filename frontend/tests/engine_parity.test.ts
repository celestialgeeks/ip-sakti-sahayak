// Engine parity guard (spec §5.3.4): engine.ts must reproduce the outputs the
// authoritative Python engine produced when scripts/gen_engine_parity_fixture.py
// generated backend/tests/fixtures/engine_parity.json. If this test fails,
// the two engines have drifted — fix engine.ts (or regenerate the fixture
// deliberately via the Python script and re-review both sides).
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { simulateClientFormulation } from "../src/lib/formulation/engine.ts";
import { DEFAULT_BOTANICALS, STARTER_PRESETS } from "../src/lib/formulation/defaults.ts";
import type { IngredientRatio } from "../src/lib/formulation/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(here, "../../backend/tests/fixtures/engine_parity.json");

const fixture = JSON.parse(readFileSync(FIXTURE, "utf8"));

test("engine.ts matches engine.py parity fixture on every vector", () => {
  assert.ok(Array.isArray(fixture.vectors) && fixture.vectors.length >= 8);
  for (const vec of fixture.vectors) {
    const ingredients = vec.ingredients.map(
      (i: { herb_id: string; ratio: number }): IngredientRatio => ({
        herb_id: i.herb_id,
        ratio: i.ratio,
      })
    );
    const got = simulateClientFormulation(
      vec.name,
      ingredients,
      vec.entity_type,
      DEFAULT_BOTANICALS
    );
    const exp = vec.expected;

    for (const key of [
      "total_ratio",
      "is_balanced",
      "chou_talalay_ci",
      "sec_3e_status",
      "bioavailability_multiplier",
      "anti_inflammatory_suppression",
      "ojas_power_score",
      "tier",
      "medicine_quality_score",
      "patentability_scope_score",
      "tkdl_concordance_score",
      "nba_abs_royalty_percentage",
      "cost_per_unit",
      "quadrant",
    ] as const) {
      const gotRecord = got as unknown as Record<string, unknown>;
      assert.deepStrictEqual(
        gotRecord[key],
        exp[key],
        `${vec.name}: ${key} — expected ${JSON.stringify(exp[key])}, got ${JSON.stringify(gotRecord[key])}`
      );
    }

    const gotContribs = new Map(
      (got.contributions ?? []).map((c) => [
        c.herb_id,
        `${c.layer}|${c.quality_delta}|${c.ci_delta}|${c.patentability_delta}|${c.royalty_delta}|${c.cost_delta}|${c.state}`,
      ])
    );
    for (const c of exp.contributions) {
      const want = `${c.layer}|${c.quality_delta}|${c.ci_delta}|${c.patentability_delta}|${c.royalty_delta}|${c.cost_delta}|${c.state}`;
      assert.strictEqual(gotContribs.get(c.herb_id), want, `${vec.name}: contribution drift on ${c.herb_id}`);
      const gotFix = (got.contributions ?? []).find((x) => x.herb_id === c.herb_id)?.fix;
      assert.strictEqual(gotFix ? gotFix.target_ratio : null, c.fix_target, `${vec.name}: fix target on ${c.herb_id}`);
      assert.strictEqual(gotFix ? gotFix.action_type : null, c.fix_action, `${vec.name}: fix action on ${c.herb_id}`);
    }

    const gotWarnings = got.patient_safety_warnings
      .map((w) => `${w.herb_id}:${w.severity}`)
      .sort();
    assert.deepStrictEqual(gotWarnings, exp.warning_ids, `${vec.name}: warning drift`);
  }
});

test("offline catalog mirrors the backend data files", () => {
  // defaults.ts is a generated snapshot of backend/data/formulation/*.json.
  const botanicals = JSON.parse(
    readFileSync(resolve(here, "../../backend/data/formulation/botanicals.json"), "utf8")
  );
  const presets = JSON.parse(
    readFileSync(resolve(here, "../../backend/data/formulation/presets.json"), "utf8")
  );
  assert.strictEqual(DEFAULT_BOTANICALS.length, botanicals.length, "herb count drifted — run gen_offline_catalog.mjs");
  assert.strictEqual(
    JSON.stringify(DEFAULT_BOTANICALS.map((b) => [b.id, b.safety_ceiling_percent ?? null])),
    JSON.stringify(botanicals.map((b: { id: string; safety_ceiling_percent?: number }) => [b.id, b.safety_ceiling_percent ?? null])),
    "herb metadata drifted — run: node scripts/gen_offline_catalog.mjs"
  );
  assert.strictEqual(
    JSON.stringify(STARTER_PRESETS.map((p) => p.id)),
    JSON.stringify(presets.map((p: { id: string }) => p.id)),
    "preset ids drifted — run: node scripts/gen_offline_catalog.mjs"
  );
});
