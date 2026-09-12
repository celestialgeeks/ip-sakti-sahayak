"""
Confidence Scorer — Compute answer confidence based on source quality and relevance.
"""

from typing import List, Dict, Any
from app.models.schemas import Citation


# Confidence tier weights
TIER_WEIGHTS = {
    "primary_legislation": 1.0,
    "secondary_rules": 0.8,
    "guidance": 0.6,
    "commentary": 0.4,
}


def compute_confidence(
    search_results: List[Dict[str, Any]],
    citations: List[Citation],
) -> float:
    """
    Compute a confidence score (0.0 - 1.0) for an answer based on:
    1. Relevance scores from vector search
    2. Number of supporting citations
    3. Authority tier of cited sources
    
    Returns:
        Confidence score between 0.0 and 1.0.
    """
    if not search_results:
        return 0.0

    # Factor 1: Average relevance score from top results
    top_scores = [r["score"] for r in search_results[:5]]
    avg_relevance = sum(top_scores) / len(top_scores) if top_scores else 0.0

    # Factor 2: Citation coverage (more citations = higher confidence)
    citation_count = len(citations)
    citation_factor = min(citation_count / 3.0, 1.0)  # Max out at 3 citations

    # Factor 3: Source authority (weighted by tier)
    if citations:
        tier_scores = [
            TIER_WEIGHTS.get(c.confidence_tier, 0.3) for c in citations
        ]
        avg_authority = sum(tier_scores) / len(tier_scores)
    else:
        avg_authority = 0.0

    # Weighted combination
    confidence = (
        0.4 * avg_relevance
        + 0.3 * citation_factor
        + 0.3 * avg_authority
    )

    return round(min(max(confidence, 0.0), 1.0), 2)
