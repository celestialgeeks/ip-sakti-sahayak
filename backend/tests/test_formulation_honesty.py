"""
Formulation Lab honesty + persistence tests (spec §14, §16 Phase 1).

- Preset cards must carry chip values the engine actually produces (§8.3 CI check).
- Pre-FER reports must not fabricate application numbers or filing dates (§14.1).
- Scenario autosave must round-trip through the SQLite-backed API (§14.7).
"""

import json
from pathlib import Path

from fastapi.testclient import TestClient
from app.main import app
from app.models.formulation import (
    FormulationSimulateRequest,
    IngredientRatioInput,
)
from app.core.formulation.engine import simulate_formulation

client = TestClient(app)

PRESETS_FILE = (
    Path(__file__).resolve().parent.parent / "data" / "formulation" / "presets.json"
)


def test_preset_computed_chips_match_engine():
    """§8.3: declared chip values must equal recomputed values, or CI fails."""
    presets = json.loads(PRESETS_FILE.read_text(encoding="utf-8"))
    for preset in presets:
        req = FormulationSimulateRequest(
            title=preset["id"],
            ingredients=[
                IngredientRatioInput(herb_id=i["herb_id"], ratio=i["ratio"])
                for i in preset["ingredients"]
            ],
        )
        sim = simulate_formulation(req)
        computed = preset.get("computed")
        assert computed is not None, f"{preset['id']} has no computed chips"
        assert computed["quality"] == sim.medicine_quality_score, preset["id"]
        assert computed["ci"] == sim.chou_talalay_ci, preset["id"]
        assert computed["sec_3e_status"] == sim.sec_3e_status, preset["id"]
        assert computed["tkdl_concordance_score"] == sim.tkdl_concordance_score, preset["id"]
        assert computed["tier"] == sim.tier.value, preset["id"]
        assert preset["target_tier"] == sim.tier.value, preset["id"]
        assert computed["nba_abs_royalty_percentage"] == sim.nba_abs_royalty_percentage, preset["id"]
        assert computed["cost_per_unit"] == sim.cost_per_unit, preset["id"]


def test_pre_fer_invents_no_legal_identifiers():
    response = client.post(
        "/api/formulation-lab/pre-fer",
        json={
            "formulation_title": "Honesty Probe",
            "ingredients": [
                {"herb_id": "ashwagandha", "ratio": 40.0},
                {"herb_id": "haridra", "ratio": 30.0},
                {"herb_id": "pippali", "ratio": 5.0},
                {"herb_id": "ghee", "ratio": 15.0},
                {"herb_id": "shilajit", "ratio": 10.0},
            ],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["application_no"] is None
    assert data["filing_date"] is None
    assert "provenance" in data
    raw = json.dumps(data)
    assert "IN/2026" not in raw, "Fabricated application number present"


def test_simulate_returns_contributions_and_entity_echo():
    response = client.post(
        "/api/formulation-lab/simulate",
        json={
            "title": "Attribution Probe",
            "entity_type": "foreign",
            "ingredients": [
                {"herb_id": "ashwagandha", "ratio": 40.0},
                {"herb_id": "pippali", "ratio": 5.0},
                {"herb_id": "ghee", "ratio": 15.0},
                {"herb_id": "haridra", "ratio": 30.0},
                {"herb_id": "shilajit", "ratio": 10.0},
            ],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["entity_type"] == "foreign"
    assert data["nba_abs_royalty_percentage"] == 5.0
    ids = {c["herb_id"] for c in data["contributions"]}
    assert ids == {"ashwagandha", "pippali", "ghee", "haridra", "shilajit"}
    for c in data["contributions"]:
        assert c["layer"] in ("arthin", "yogavahi", "anupana", "sah_caraka", "resin_bhasma", "supportive")
        for key in ("quality_delta", "ci_delta", "patentability_delta", "royalty_delta", "cost_delta"):
            assert isinstance(c[key], (int, float))


def test_scenario_save_list_get_delete_roundtrip():
    payload = {
        "id": "test-scenario-1",
        "title": "Autosave Probe",
        "entity_type": "domestic",
        "ingredients": [
            {"herb_id": "ashwagandha", "ratio": 50.0, "is_locked": False},
            {"herb_id": "pippali", "ratio": 5.0, "is_locked": False},
            {"herb_id": "ghee", "ratio": 45.0, "is_locked": False},
        ],
    }
    r = client.post("/api/formulation-lab/scenarios", json=payload)
    assert r.status_code == 200 and r.json()["saved"] == "test-scenario-1"

    r = client.get("/api/formulation-lab/scenarios")
    assert r.status_code == 200
    assert any(s["id"] == "test-scenario-1" for s in r.json())

    r = client.get("/api/formulation-lab/scenarios/test-scenario-1")
    assert r.status_code == 200
    data = r.json()
    assert data["title"] == "Autosave Probe"
    assert {i["herb_id"] for i in data["ingredients"]} == {"ashwagandha", "pippali", "ghee"}

    # Upsert: same id, new title
    payload["title"] = "Autosave Probe v2"
    r = client.post("/api/formulation-lab/scenarios", json=payload)
    assert r.status_code == 200
    r = client.get("/api/formulation-lab/scenarios/test-scenario-1")
    assert r.json()["title"] == "Autosave Probe v2"

    r = client.delete("/api/formulation-lab/scenarios/test-scenario-1")
    assert r.status_code == 200
    r = client.get("/api/formulation-lab/scenarios/test-scenario-1")
    assert r.status_code == 404


def test_synonyms_endpoint():
    r = client.get("/api/formulation-lab/synonyms")
    assert r.status_code == 200
    syn = r.json()["synonyms"]
    assert syn["emblica-officinalis"] == "amla"
    assert syn["azadirachta-indica"] == "neem"
    assert syn["boswellia-serrata"] == "shallaki"
