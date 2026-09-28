// Stage-trail availability (spec §3/§12/§13): the crumb may never open a view
// the gate ladder says is unmet, and a locked crumb must carry the reason
// instead of disappearing (§11.1).
import { test } from "node:test";
import assert from "node:assert";
import {
  computeStageAvailability,
  stagePosition,
  LAB_STAGES,
  type StageInput,
} from "../src/lib/formulation/stages.ts";
import { simulateClientFormulation } from "../src/lib/formulation/engine.ts";
import { STARTER_PRESETS } from "../src/lib/formulation/defaults.ts";

function availability(overrides: Partial<StageInput> = {}) {
  const base: StageInput = {
    ingredientCount: 4,
    isBalanced: true,
    totalRatio: 100.0,
    canRunPreFer: true,
    preFerSeen: false,
    onBench: true,
  };
  return computeStageAvailability({ ...base, ...overrides });
}

test("doors are always reachable; the bench needs a formulation first", () => {
  const fresh = availability({ ingredientCount: 0, canRunPreFer: false, onBench: false });
  assert.strictEqual(fresh.doors.unlocked, true);
  assert.strictEqual(fresh.bench.unlocked, false);
  assert.match(fresh.bench.reason, /starting point/);
});

test("§12 entry gate: fewer than 3 constituents locks Examine with its own reason", () => {
  const two = availability({ ingredientCount: 2, canRunPreFer: false });
  assert.strictEqual(two.examine.unlocked, false);
  assert.match(two.examine.reason, /at least 3 constituents/);
});

test("unbalanced composition locks Examine and names the actual total", () => {
  const off = availability({ isBalanced: false, totalRatio: 92.5, canRunPreFer: false });
  assert.strictEqual(off.examine.unlocked, false);
  assert.match(off.examine.reason, /Normalise to 100\.0% w\/w \(now 92\.5%\)/);
});

test("Dossier is closed until a Pre-FER run exists, then stays open", () => {
  assert.strictEqual(availability({ preFerSeen: false }).dossier.unlocked, false);
  assert.match(availability({ preFerSeen: false }).dossier.reason, /examination precedes export/);
  // A stale report still opens the view — DossierView shows the staleness gate itself (§13).
  assert.strictEqual(availability({ preFerSeen: true }).dossier.unlocked, true);
});

test("no crumb is ever unlocked ahead of the §12 gate, across every preset", () => {
  for (const preset of STARTER_PRESETS) {
    const sim = simulateClientFormulation(preset.title, preset.ingredients, "domestic");
    const canRunPreFer = sim.is_balanced && preset.ingredients.length >= 3;
    const avail = availability({
      ingredientCount: preset.ingredients.length,
      isBalanced: sim.is_balanced,
      totalRatio: sim.total_ratio,
      canRunPreFer,
    });
    assert.strictEqual(avail.examine.unlocked, canRunPreFer, `examine crumb: ${preset.id}`);
    if (!canRunPreFer) {
      assert.ok(avail.examine.reason.length > 0, `locked crumb needs a reason: ${preset.id}`);
    }
  }
});

test("stage order and rank match the documented progression", () => {
  assert.deepStrictEqual(LAB_STAGES, ["doors", "bench", "examine", "dossier"]);
  assert.strictEqual(stagePosition("doors"), 1);
  assert.strictEqual(stagePosition("dossier"), 4);
});
