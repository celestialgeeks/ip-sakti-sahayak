"""
Tests for /api/classify and /api/abs-check endpoints.
Validates regulatory categorization under the Drugs & Cosmetics Act (Schedule T, Rule 158-B)
and Access and Benefit Sharing (ABS) compliance under the Biological Diversity Act, 2002.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_classify_classical_formulation(async_client: AsyncClient):
    """
    Formulations cited in authoritative classical texts (First Schedule of D&C Act)
    must classify as CLASSICAL with Section 3(p) patent bar and Schedule T licensing.
    """
    payload = {
        "formulation_name": "Triphala Churna",
        "description": "Herbal powder from Haritaki, Bibhitaki, and Amalaki",
        "ingredients": ["Terminalia chebula", "Terminalia bellirica", "Phyllanthus emblica"],
        "is_in_authoritative_text": True,
        "intended_use": "Digestive wellness",
    }
    response = await async_client.post("/api/classify", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["category"] == "classical"
    assert "Schedule T" in data["regulatory_pathway"]
    assert any("3(p)" in p for p in data["ip_protections"])
    assert "TKDL" in data["tkdl_implications"]


@pytest.mark.asyncio
async def test_classify_proprietary_formulation(async_client: AsyncClient):
    """
    Proprietary formulations not in ancient texts, developed for therapeutic usage,
    must classify as PROPRIETARY under Rule 158-B with patent eligibility for novel non-obvious composition.
    """
    payload = {
        "formulation_name": "AyurRespir-Plus",
        "description": "Proprietary synergistic polyherbal extract",
        "ingredients": ["Curcuma longa extract", "Piper nigrum extract"],
        "is_in_authoritative_text": False,
        "intended_use": "medicinal",
    }
    response = await async_client.post("/api/classify", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["category"] == "proprietary"
    assert "158-B" in data["regulatory_pathway"]
    assert any("Patent possible" in p for p in data["ip_protections"])
    assert "NBA approval" in data["abs_obligations"]


@pytest.mark.asyncio
async def test_classify_unknown_details(async_client: AsyncClient):
    """When details are insufficient to categorize, return UNKNOWN category."""
    payload = {
        "formulation_name": "Generic Compound",
    }
    response = await async_client.post("/api/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "unknown"


@pytest.mark.asyncio
async def test_abs_check_commercial_utilisation(async_client: AsyncClient):
    """
    Commercial utilisation of biological resources requires mandatory NBA Form I approval
    under Section 3 and a Benefit Sharing agreement.
    """
    payload = {
        "biological_resource": "Withania somnifera (Ashwagandha)",
        "source_location": "Madhya Pradesh, India",
        "commercial_use": True,
        "involves_traditional_knowledge": False,
    }
    response = await async_client.post("/api/abs-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    checklist = data["checklist"]
    assert len(checklist) > 0

    nba_req = next((item for item in checklist if "NBA" in item["requirement"]), None)
    assert nba_req is not None
    assert nba_req["status"] == "required"
    assert "Section 3" in nba_req["guidance"]

    benefit_req = next((item for item in checklist if "Benefit Sharing" in item["requirement"]), None)
    assert benefit_req is not None
    assert benefit_req["status"] == "required"


@pytest.mark.asyncio
async def test_abs_check_research_utilisation(async_client: AsyncClient):
    """
    Non-commercial research by Indian researchers requires State Biodiversity Board (SBB) intimation
    under Section 7 rather than NBA commercial approval.
    """
    payload = {
        "biological_resource": "Ocimum sanctum (Tulsi)",
        "source_location": "Varanasi, India",
        "commercial_use": False,
        "involves_traditional_knowledge": False,
    }
    response = await async_client.post("/api/abs-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    checklist = data["checklist"]
    sbb_req = next((item for item in checklist if "SBB" in item["requirement"]), None)
    assert sbb_req is not None
    assert sbb_req["status"] == "required"
    assert "Section 7" in sbb_req["guidance"]


@pytest.mark.asyncio
async def test_abs_check_traditional_knowledge_consent(async_client: AsyncClient):
    """
    If biological resource utilisation involves Traditional Knowledge, prior informed consent
    from local communities/BMC under Section 36 is strictly required.
    """
    payload = {
        "biological_resource": "Trichopus zeylanicus (Arogyapacha)",
        "source_location": "Western Ghats, Kerala",
        "commercial_use": True,
        "involves_traditional_knowledge": True,
    }
    response = await async_client.post("/api/abs-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    checklist = data["checklist"]
    tk_req = next((item for item in checklist if "Consent from Local Communities" in item["requirement"]), None)
    assert tk_req is not None
    assert tk_req["status"] == "required"
    assert "Section 36" in tk_req["guidance"]
