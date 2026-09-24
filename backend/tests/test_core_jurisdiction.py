"""
Unit tests for app.core.jurisdiction.
Validates collection routing and statutory context definitions.
"""

import pytest
from app.core.jurisdiction import get_jurisdiction_context
from app.models.enums import Jurisdiction, QdrantCollection


def test_jurisdiction_india_context():
    """India jurisdiction must include Indian IP, regulatory, biodiversity, and TKDL collections."""
    ctx = get_jurisdiction_context(Jurisdiction.INDIA)
    assert ctx["label"] == "India"
    assert QdrantCollection.INDIA_IP_LAW.value in ctx["collections"]
    assert QdrantCollection.INDIA_TKDL.value in ctx["collections"]
    assert any("Patents Act, 1970" in s for s in ctx["key_statutes"])
    assert any("Biological Diversity Act" in s for s in ctx["key_statutes"])


def test_jurisdiction_international_context():
    """International jurisdiction must include international IP, market, and treaty statutes."""
    ctx = get_jurisdiction_context(Jurisdiction.INTERNATIONAL)
    assert ctx["label"] == "International"
    assert QdrantCollection.INTERNATIONAL_IP.value in ctx["collections"]
    assert any("TRIPS" in s for s in ctx["key_statutes"])
    assert any("Nagoya Protocol" in s for s in ctx["key_statutes"])


def test_jurisdiction_both_context():
    """Both jurisdiction must include all collections for comparative analysis."""
    ctx = get_jurisdiction_context(Jurisdiction.BOTH)
    assert len(ctx["collections"]) == len(list(QdrantCollection))
