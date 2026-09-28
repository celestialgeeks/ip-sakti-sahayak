// Gate ladder ordering tests (spec §7): first match wins, deterministic, and
// the verdict line can never disagree with the CTA (same function feeds both).
import { test } from "node:test";
import assert from "node:assert";
import { computeNextAction, buildVerdictLine } from "../src/lib/formulation/gates.ts";
import type { GateInput } from "../src/lib/formulation/gates.ts";
import { simulateClientFormulation } from "../src/lib/formulation/engine.ts";
import { STARTER_PRESETS } from "../src/lib/formulation/defaults.ts";
import type { Directive } from "../src/lib/formulation/types.ts";

function gateFor(presetId: string, overrides: Partial<GateInput> = {}): GateInput {
  const preset = STARTER_PRESETS.find((p) => p.id === presetId)!;
  const sim = simulateClientFormulation(preset.title, preset.ingredients, "domestic");
  return {
    ingredientCount: preset.ingredients.length,
    sim,
    entityChosen: true,
    preFerRun: true,
    fatalDirectives: [],
    ...overrides,
  };
}

test("empty bench routes to the herb drawer", () => {
  const sim = simulateClientFormulation("Empty", [], "domestic");
  const g: GateInput = { ingredientCount: 0, sim, entityChosen: false, preFerRun: false, fatalDirectives: [] };
  assert.strictEqual(computeNextAction(g).gate, "empty");
  assert.strictEqual(computeNextAction(g).fire, "open_herb_drawer");
});

test("unbalanced composition routes to Auto-Balance before anything else", () => {
  const g = gateFor("rev_3_2_benchmark");
  g.sim = { ...g.sim, is_balanced: false, total_ratio: 90.0 };
  const action = computeNextAction(g);
  assert.strictEqual(action.gate, "unbalanced");
  assert.strictEqual(action.fire, "autobalance");
});

test("CRITICAL safety outranks §3(e) which outranks §3(p) (ordered ladder)", () => {
  // prameha preset: CI cleared but pippali 10% is CRITICAL.
  const gCrit = gateFor("prameha_fenugreek_quatro");
  assert.strictEqual(computeNextAction(gCrit).gate, "critical_safety");

  // shwasa preset: REJECTED §3(e), no criticals.
  const g3e = gateFor("shwasa_cheap_kwath");
  assert.strictEqual(computeNextAction(g3e).gate, "sec3e");

  // rev_3_2: clears 3(e) but TKDL 92 → §3(p) gate.
  const g3p = gateFor("rev_3_2_benchmark");
  assert.strictEqual(computeNextAction(g3p).gate, "sec3p");
});

test("all-clear bench routes to run_prefer, then export after a clean FER", () => {
  // rasayana_matrix: balanced, cleared, no critical (guduchi dilutes TKDL to 83).
  const g = gateFor("rasayana_matrix", { preFerRun: false });
  assert.strictEqual(computeNextAction(g).gate, "run_prefer");

  const gDone = gateFor("rasayana_matrix", { preFerRun: true });
  assert.strictEqual(computeNextAction(gDone).gate, "export");

  const gFatal = gateFor("rasayana_matrix", {
    preFerRun: true,
    fatalDirectives: [{ action_type: "add", herb_id: "pippali", target_ratio: 5, text: "x" } as Directive],
  });
  assert.strictEqual(computeNextAction(gFatal).gate, "apply_remedy");
});

test("verdict line names the same gate as the CTA — they cannot disagree", () => {
  for (const presetId of ["rev_3_2_benchmark", "shwasa_cheap_kwath", "prameha_fenugreek_quatro", "rasayana_matrix"]) {
    const g = gateFor(presetId);
    const action = computeNextAction(g);
    const line = buildVerdictLine(g);
    if (action.gate === "sec3p") assert.match(line, /§3\(p\)/, presetId);
    if (action.gate === "sec3e") assert.match(line, /§3\(e\)/, presetId);
    if (action.gate === "critical_safety") assert.match(line, /ceiling/, presetId);
    if (action.gate === "export") assert.match(line, /ready for export/, presetId);
  }
});
