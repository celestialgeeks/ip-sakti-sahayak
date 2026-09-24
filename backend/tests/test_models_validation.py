"""
Unit tests for app.models.schemas and enums.
Validates Pydantic schema validation boundaries, defaults, and serializations.
"""

import pytest
from pydantic import ValidationError
from app.models.schemas import ChatRequest, ChatResponse, Citation, ClassifyRequest, ABSCheckRequest, FeedbackRequest
from app.models.enums import Jurisdiction, Language, ConfidenceLevel, FormulationCategory


def test_chat_request_valid_and_defaults():
    """Ensure ChatRequest sets defaults for jurisdiction and language."""
    req = ChatRequest(query="How to protect an Ayurvedic trademark?")
    assert req.query == "How to protect an Ayurvedic trademark?"
    assert req.jurisdiction == Jurisdiction.INDIA
    assert req.language == Language.ENGLISH
    assert req.stream is False


def test_chat_request_validation_boundaries():
    """Ensure ChatRequest rejects empty query or query exceeding 2000 chars."""
    with pytest.raises(ValidationError):
        ChatRequest(query="")

    with pytest.raises(ValidationError):
        ChatRequest(query="x" * 2001)


def test_citation_serialization():
    """Ensure Citation serializes with all required fields."""
    citation = Citation(
        id="c1",
        source="The Patents Act, 1970 (Section 3(p))",
        text="Section 3(p) excerpt...",
        jurisdiction="india",
        category="ip_law",
        url="https://ipindia.gov.in",
    )
    d = citation.model_dump()
    assert d["id"] == "c1"
    assert d["confidence_tier"] == "primary_legislation"
    assert d["url"] == "https://ipindia.gov.in"


def test_classify_request_serialization():
    """Ensure ClassifyRequest handles list of ingredients and optional fields."""
    req = ClassifyRequest(
        formulation_name="Chyawanprash",
        ingredients=["Amla", "Ashwagandha", "Ghee"],
        is_in_authoritative_text=True,
    )
    assert len(req.ingredients) == 3
    assert req.is_in_authoritative_text is True


def test_feedback_request_validation():
    """Ensure FeedbackRequest requires message_id and rating."""
    fb = FeedbackRequest(message_id="msg_001", rating="helpful")
    assert fb.rating == "helpful"
    assert fb.comment is None
