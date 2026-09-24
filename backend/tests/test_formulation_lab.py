"""
Tests for Formulation Lab simulation, Chou-Talalay CI, and Pre-FER endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_herbs():
    response = client.get("/api/formulation-lab/herbs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    ids = [item["id"] for item in data]
    assert "ashwagandha" in ids
    assert "shilajit" in ids
    assert "haridra" in ids
    assert "pippali" in ids


def test_get_presets():
    response = client.get("/api/formulation-lab/presets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    preset_ids = [p["id"] for p in data]
    assert "rev_3_2_benchmark" in preset_ids


def test_simulate_optimal_synergy():
    payload = {
        "title": "Synergistic Benchmark",
        "ingredients": [
            {"herb_id": "ashwagandha", "ratio": 40.0, "is_locked": False},
            {"herb_id": "shilajit", "ratio": 10.0, "is_locked": False},
            {"herb_id": "haridra", "ratio": 30.0, "is_locked": False},
            {"herb_id": "pippali", "ratio": 5.0, "is_locked": False},
            {"herb_id": "ghee", "ratio": 15.0, "is_locked": False}
        ]
    }
    response = client.post("/api/formulation-lab/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_balanced"] is True
    assert data["chou_talalay_ci"] < 0.85
    assert data["sec_3e_status"] == "CLEARED"
    assert data["ojas_power_score"] >= 6500
    assert data["tier"] in ["vriddha", "siddha", "divya_rasayana"]
    assert len(data["active_buffs"]) > 0


def test_simulate_suboptimal_mere_admixture():
    payload = {
        "title": "Suboptimal Dilution",
        "ingredients": [
            {"herb_id": "ashwagandha", "ratio": 10.0, "is_locked": False},
            {"herb_id": "shilajit", "ratio": 35.0, "is_locked": False},
            {"herb_id": "haridra", "ratio": 25.0, "is_locked": False},
            {"herb_id": "pippali", "ratio": 0.0, "is_locked": False},
            {"herb_id": "ghee", "ratio": 30.0, "is_locked": False}
        ]
    }
    response = client.post("/api/formulation-lab/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["chou_talalay_ci"] > 1.0
    assert data["sec_3e_status"] in ["BORDERLINE", "REJECTED"]
    assert "⚠️ Lacks Yogavāhī Bio-Catalyst" in data["active_debuffs"]
    assert data["tier"] in ["bala", "kumara"]


def test_pre_fer_report():
    payload = {
        "formulation_title": "Ashwagandha Curcumin Nano-Liposome",
        "ingredients": [
            {"herb_id": "ashwagandha", "ratio": 40.0, "is_locked": False},
            {"herb_id": "shilajit", "ratio": 10.0, "is_locked": False},
            {"herb_id": "haridra", "ratio": 30.0, "is_locked": False},
            {"herb_id": "pippali", "ratio": 5.0, "is_locked": False},
            {"herb_id": "ghee", "ratio": 15.0, "is_locked": False}
        ]
    }
    response = client.post("/api/formulation-lab/pre-fer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "application_no" in data
    assert data["sec_3e_synergy_verified"] is True
    assert len(data["objections"]) >= 2
    assert len(data["recommended_claim_draft"]) >= 2
