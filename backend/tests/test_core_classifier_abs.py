"""
Unit tests for app.core.classifier and app.core.abs_helper.
Validates decision tree branches and ABS checklist generation logic.
"""

import pytest
from app.core.classifier import classify_formulation
from app.core.abs_helper import check_abs_compliance
from app.models.enums import FormulationCategory


def test_classify_classical_decision():
    """Formulation in authoritative text must classify as CLASSICAL."""
    res = classify_formulation(
        formulation_name="Sitopaladi Churna",
        description="Classical Ayurvedic formulation for cough and cold",
        is_in_authoritative_text=True,
    )
    assert res.category == FormulationCategory.CLASSICAL
    assert any("§3(p)" in p or "3(p)" in p for p in res.ip_protections)
    assert "Schedule T" in res.regulatory_pathway


def test_classify_proprietary_decision():
    """Novel medicinal formulation not in authoritative texts must classify as PROPRIETARY."""
    res = classify_formulation(
        formulation_name="AyurDiab-Control",
        description="Novel polyherbal composition",
        is_in_authoritative_text=False,
        intended_use="medicinal",
    )
    assert res.category == FormulationCategory.PROPRIETARY
    assert "Rule 158-B" in res.regulatory_pathway
    assert any("Patent possible" in p for p in res.ip_protections)


def test_classify_unknown_fallback():
    """Unclassified or insufficient input must yield UNKNOWN category."""
    res = classify_formulation(
        formulation_name="Vague Extract",
        is_in_authoritative_text=None,
    )
    assert res.category == FormulationCategory.UNKNOWN


def test_abs_compliance_commercial():
    """Commercial utilisation triggers mandatory NBA approval and Benefit Sharing."""
    res = check_abs_compliance(
        biological_resource="Curcuma longa",
        commercial_use=True,
    )
    assert res.compliant is False  # Because mandatory requirements remain
    reqs = [item.requirement for item in res.checklist if item.status == "required"]
    assert any("NBA" in r for r in reqs)
    assert any("Benefit Sharing" in r for r in reqs)


def test_abs_compliance_non_commercial():
    """Research utilisation triggers SBB intimation instead of NBA approval."""
    res = check_abs_compliance(
        biological_resource="Azadirachta indica (Neem)",
        commercial_use=False,
    )
    reqs = [item.requirement for item in res.checklist if item.status == "required"]
    assert any("SBB" in r for r in reqs)
    assert not any("NBA" in r for r in reqs)
