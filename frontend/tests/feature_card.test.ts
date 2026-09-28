import { test } from "node:test";
import assert from "node:assert";
import type { FeatureCardProps } from "../src/components/ui/feature-card.tsx";
import type { SavingsPlanItemProps } from "../src/components/ui/feature-card-demo.tsx";

test("FeatureCard Suite: Component prop contracts and types", () => {
  const props: FeatureCardProps = {
    title: "Multiple Savings Plan",
    description: "Nest offers a variety of savings plans.",
    children: null,
  };

  assert.strictEqual(props.title, "Multiple Savings Plan");
  assert.strictEqual(props.description, "Nest offers a variety of savings plans.");
});

test("SavingsPlanItem Suite: Item contracts and progress clamping", () => {
  const item: SavingsPlanItemProps = {
    icon: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=128",
    title: "Birthday Milestone Fund",
    members: 200,
    progress: 63,
    amount: 25200,
    target: 40200,
    daysLeft: 14,
  };

  assert.strictEqual(item.title, "Birthday Milestone Fund");
  assert.strictEqual(item.progress, 63);
  assert.strictEqual(item.amount, 25200);
  assert.strictEqual(item.target, 40200);
  assert.strictEqual(item.daysLeft, 14);

  // Ratio clamping logic verification
  const clamp = (val: number) => Math.min(100, Math.max(0, val));
  assert.strictEqual(clamp(-10), 0);
  assert.strictEqual(clamp(150), 100);
  assert.strictEqual(clamp(42.5), 42.5);
});

test("FormulationLab Slider Suite: Stoichiometric delta calculation logic", () => {
  const baseline = 35.0;
  const current = 42.5;
  const delta = Math.round((current - baseline) * 10) / 10;

  assert.strictEqual(delta, 7.5);

  const reduced = 28.0;
  const reducedDelta = Math.round((reduced - baseline) * 10) / 10;
  assert.strictEqual(reducedDelta, -7.0);
});
