"""
Unit tests for app.core.confidence_scorer.
Validates mathematical weighting, tier weights, and boundary conditions.
"""

import pytest
from app.core.confidence_scorer import compute_confidence
from app.models.schemas import Citation


def test_empty_results_zero_confidence():
    """Empty search results must return 0.0 confidence."""
    assert compute_confidence([], []) == 0.0


def test_high_confidence_calculation():
    """High vector relevance + 3 primary legislation citations must yield >= 0.85 confidence."""
    search_results = [
        {"score": 0.95},
        {"score": 0.92},
        {"score": 0.90},
    ]
    citations = [
        Citation(id="1", source="Patents Act §3(p)", text="...", jurisdiction="india", category="ip", confidence_tier="primary_legislation"),
        Citation(id="2", source="TKDL Prior Art", text="...", jurisdiction="india", category="tkdl", confidence_tier="primary_legislation"),
        Citation(id="3", source="Biological Diversity Act", text="...", jurisdiction="india", category="abs", confidence_tier="primary_legislation"),
    ]
    score = compute_confidence(search_results, citations)
    assert score >= 0.85
    assert score <= 1.0


def test_low_confidence_calculation():
    """Low relevance score and no citations must yield low confidence (< 0.60)."""
    search_results = [
        {"score": 0.35},
        {"score": 0.30},
    ]
    citations = []
    score = compute_confidence(search_results, citations)
    assert score < 0.60


def test_authority_tier_weighting():
    """Primary legislation citations must produce higher confidence than commentary citations."""
    search_results = [{"score": 0.80}]
    
    primary_citations = [
        Citation(id="1", source="Act", text="...", jurisdiction="india", category="ip", confidence_tier="primary_legislation")
    ]
    commentary_citations = [
        Citation(id="1", source="Blog", text="...", jurisdiction="india", category="ip", confidence_tier="commentary")
    ]

    score_primary = compute_confidence(search_results, primary_citations)
    score_commentary = compute_confidence(search_results, commentary_citations)

    assert score_primary > score_commentary
