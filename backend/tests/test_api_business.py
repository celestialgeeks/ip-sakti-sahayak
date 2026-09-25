"""
API tests for the Business Enablement endpoints:
/api/business/funding/match, /api/business/suppliers, /api/business/label/check.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_funding_match_endpoint(async_client: AsyncClient):
    payload = {
        "stage": "new", "loan_amount": 800000, "project_cost": 800000,
        "turnover": 3000000, "sector": "manufacturing", "location": "rural",
        "social_category": "st", "is_woman": True, "is_greenfield": True,
        "wants_collateral_free": True, "udyam_registered": False,
    }
    res = await async_client.post("/api/business/funding/match", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "matches" in data and len(data["matches"]) == 4
    assert data["size_class"] in ("micro", "small", "medium", "large")
    # Every match carries a citation source
    for m in data["matches"]:
        assert m["citation"]["source"]


@pytest.mark.asyncio
async def test_suppliers_endpoint_and_gi_filter(async_client: AsyncClient):
    res = await async_client.get("/api/business/suppliers")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert "disclaimer" in data

    res2 = await async_client.get("/api/business/suppliers?gi_only=true")
    assert res2.status_code == 200
    for item in res2.json()["items"]:
        assert len(item["gi_tags"]) >= 1


@pytest.mark.asyncio
async def test_label_check_endpoint(async_client: AsyncClient):
    payload = {
        "draft_text": "अश्वगन्धा चूर्ण. Manufactured by Divya Pvt Ltd. Mfg Lic No MH-1/2. Net 100g. Batch 4. Mfg 09/2026 Exp 08/2029. Ingredients: Withania. MRP ₹100.",
        "ruleset": "ayush",
    }
    res = await async_client.post("/api/business/label/check", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["ruleset"] == "ayush"
    assert 0 <= data["score"] <= 100
    assert len(data["findings"]) == data["total"]


@pytest.mark.asyncio
async def test_label_check_unknown_ruleset_400(async_client: AsyncClient):
    res = await async_client.post("/api/business/label/check",
                                  json={"draft_text": "some label", "ruleset": "xyz"})
    assert res.status_code == 400
