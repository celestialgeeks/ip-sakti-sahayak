"""
Engine parity guard (spec §5.3.4).

backend/tests/fixtures/engine_parity.json is generated from engine.py by
scripts/gen_engine_parity_fixture.py. This test re-scores every vector and
asserts the committed fixture is current — the same file is asserted against
engine.ts by frontend/tests/engine_parity.test.ts, so any drift between the
two engines fails CI on both sides.
"""

import json
from pathlib import Path

from app.models.formulation import (
    FormulationSimulateRequest,
    IngredientRatioInput,
)
from app.core.formulation.engine import simulate_formulation

FIXTURE_PATH = Path(__file__).resolve().parent / "fixtures" / "engine_parity.json"


def _load():
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_parity_fixture_exists():
    assert FIXTURE_PATH.exists(), (
        "Run: python scripts/gen_engine_parity_fixture.py"
    )


def test_engine_matches_parity_fixture():
    data = _load()
    assert len(data["vectors"]) >= 8, "Parity fixture should cover a spread of states"
    for vec in data["vectors"]:
        req = FormulationSimulateRequest(
            title=vec["name"],
            entity_type=vec["entity_type"],
            ingredients=[
                IngredientRatioInput(herb_id=i["herb_id"], ratio=i["ratio"])
                for i in vec["ingredients"]
            ],
        )
        sim = simulate_formulation(req)
        exp = vec["expected"]
        got = {
            "total_ratio": sim.total_ratio,
            "is_balanced": sim.is_balanced,
            "chou_talalay_ci": sim.chou_talalay_ci,
            "sec_3e_status": sim.sec_3e_status,
            "bioavailability_multiplier": sim.bioavailability_multiplier,
            "anti_inflammatory_suppression": sim.anti_inflammatory_suppression,
            "ojas_power_score": sim.ojas_power_score,
            "tier": sim.tier.value if hasattr(sim.tier, "value") else sim.tier,
            "medicine_quality_score": sim.medicine_quality_score,
            "patentability_scope_score": sim.patentability_scope_score,
            "tkdl_concordance_score": sim.tkdl_concordance_score,
            "nba_abs_royalty_percentage": sim.nba_abs_royalty_percentage,
            "cost_per_unit": sim.cost_per_unit,
            "quadrant": sim.quadrant,
        }
        for key, want in got.items():
            assert exp[key] == want, f"{vec['name']}: {key} expected {exp[key]}, got {want}"

        got_contribs = {
            c.herb_id: (c.layer, c.quality_delta, c.ci_delta, c.patentability_delta,
                        c.royalty_delta, c.cost_delta, c.state)
            for c in sim.contributions
        }
        for c in exp["contributions"]:
            key = c["herb_id"]
            assert key in got_contribs, f"{vec['name']}: missing contribution for {key}"
            g = got_contribs[key]
            assert g == (c["layer"], c["quality_delta"], c["ci_delta"],
                         c["patentability_delta"], c["royalty_delta"], c["cost_delta"],
                         c["state"]), f"{vec['name']}: contribution drift on {key}: {g}"

        got_warnings = sorted(f"{w['herb_id']}:{w['severity']}" for w in sim.patient_safety_warnings)
        assert got_warnings == exp["warning_ids"], f"{vec['name']}: warning drift"


def test_contributions_cover_every_active_herb():
    vec = _load()["vectors"][0]
    req = FormulationSimulateRequest(
        title=vec["name"],
        entity_type=vec["entity_type"],
        ingredients=[
            IngredientRatioInput(herb_id=i["herb_id"], ratio=i["ratio"])
            for i in vec["ingredients"]
            if i["ratio"] > 0
        ],
    )
    sim = simulate_formulation(req)
    assert {c.herb_id for c in sim.contributions} == {i["herb_id"] for i in vec["ingredients"] if i["ratio"] > 0}
    assert all(c.layer in ("arthin", "yogavahi", "anupana", "sah_caraka", "resin_bhasma", "supportive") for c in sim.contributions)


def test_preset_library_has_a_real_spread():
    """DoD (§17): at least one preset fails §3(e), one trips a safety ceiling,
    one is a §3(p) trap, and quality is not uniform."""
    presets = json.loads(
        (Path(__file__).resolve().parent.parent / "data" / "formulation" / "presets.json").read_text()
    )
    qualities = [p["computed"]["quality"] for p in presets]
    assert max(qualities) - min(qualities) >= 15, "Preset gallery has no spread"
    assert any(p["computed"]["sec_3e_status"] != "CLEARED" for p in presets), "No preset fails §3(e)"
    assert any(p["computed"]["tkdl_concordance_score"] >= 90 for p in presets), "No §3(p) trap preset"
    assert len(presets) >= 12, "Preset library should be 12-16 entries"
    for p in presets:
        assert not any(i.get("is_locked") for i in p["ingredients"]), f"{p['id']} ships a locked ingredient"
        ingr = {i["herb_id"]: i["ratio"] for i in p["ingredients"]}
        assert ingr == {k: float(v) for k, v in p["baseline_ratios"].items()}, f"{p['id']} baseline != ingredients"
