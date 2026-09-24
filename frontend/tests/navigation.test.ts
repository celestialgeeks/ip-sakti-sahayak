import { test } from "node:test";
import assert from "node:assert";
import { MAIN_NAV_ITEMS } from "../src/config/navigation.ts";

test("Navigation Suite: Navigation Items Configuration", () => {
  // Ensure we have exactly the required feature destinations
  assert.ok(Array.isArray(MAIN_NAV_ITEMS), "MAIN_NAV_ITEMS must be an array");
  assert.strictEqual(MAIN_NAV_ITEMS.length, 4, "Expected 4 primary navigation items");

  const itemIds = MAIN_NAV_ITEMS.map((item) => item.id);
  assert.ok(itemIds.includes("formulation-lab"), "Expected Formulation Lab navigation item");
  assert.ok(itemIds.includes("tkdl"), "Expected TKDL navigation item");
  assert.ok(itemIds.includes("patents"), "Expected Patents navigation item");
  assert.ok(itemIds.includes("rules"), "Expected Rules navigation item");

  const hrefs = MAIN_NAV_ITEMS.map((item) => item.href);
  assert.ok(hrefs.includes("/formulation-lab"), "Expected /formulation-lab route");
  assert.ok(hrefs.includes("/tkdl"), "Expected /tkdl route");
  assert.ok(hrefs.includes("/patents"), "Expected /patents route");
  assert.ok(hrefs.includes("/rules"), "Expected /rules route");

  // Every item must have a valid non-empty label
  for (const item of MAIN_NAV_ITEMS) {
    assert.strictEqual(typeof item.label, "string");
    assert.ok(item.label.trim().length > 0, `Label for ${item.id} must not be empty`);
  }

  // Verify explicit ordering: 1. Ayurvedic Library, 2. Formulation Lab, then others
  assert.strictEqual(MAIN_NAV_ITEMS[0].id, "tkdl", "First tool must be Ayurvedic Library");
  assert.strictEqual(MAIN_NAV_ITEMS[0].label, "Ayurvedic Library");
  assert.strictEqual(MAIN_NAV_ITEMS[1].id, "formulation-lab", "Second tool must be Formulation Lab");
  assert.strictEqual(MAIN_NAV_ITEMS[1].label, "Formulation Lab");
  assert.strictEqual(MAIN_NAV_ITEMS[2].id, "patents", "Third tool must be Patent Database & Search");
  assert.strictEqual(MAIN_NAV_ITEMS[3].id, "rules", "Fourth tool must be Latest Rules & Regulations");
  assert.strictEqual(MAIN_NAV_ITEMS[3].label, "Latest Rules & Regulations");
});


test("Navigation Suite: REGRESSION CHECK - Legal Advisor must NOT be in navigation items", () => {
  // Guard against regression: Ensure /chat / Legal Advisor is strictly excluded from sidebar/navigation
  const hasChatRoute = MAIN_NAV_ITEMS.some((item) => item.href === "/chat");
  assert.strictEqual(hasChatRoute, false, "Regression detected: /chat must not be present in MAIN_NAV_ITEMS");

  const hasAdvisorLabel = MAIN_NAV_ITEMS.some((item) =>
    item.label.toLowerCase().includes("advisor")
  );
  assert.strictEqual(hasAdvisorLabel, false, "Regression detected: 'Advisor' must not be in MAIN_NAV_ITEMS labels");
});
