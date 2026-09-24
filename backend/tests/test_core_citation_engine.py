"""
Unit tests for app.core.citation_engine.
Ensures verified source URL resolution, strict citation referencing, and deduplication.
"""

import pytest
from app.core.citation_engine import resolve_source_url, _is_chunk_referenced_in_answer, extract_citations


def test_resolve_source_url_patterns():
    """Validate URL resolution for major IP statutes and registries."""
    # Patents Act & Section 3(p)
    url_3p = resolve_source_url("The Patents Act, 1970 (Section 3(p))")
    assert "patent-act-1970" in url_3p

    # TKDL
    url_tkdl = resolve_source_url("Traditional Knowledge Digital Library (TKDL)")
    assert "tkdl.res.in" in url_tkdl

    # Biological Diversity / NBA
    url_nba = resolve_source_url("Biological Diversity Act, 2002 (National Biodiversity Authority)")
    assert "nbaindia.org" in url_nba

    # Drugs and Cosmetics Act
    url_dc = resolve_source_url("Drugs & Cosmetics Act, 1940 & Ayush Licensing")
    assert "cdsco.gov.in" in url_dc

    # TRIPS Agreement
    url_trips = resolve_source_url("WTO TRIPS Agreement on Trade-Related Aspects of IPR")
    assert "wto.org" in url_trips

    # Nagoya Protocol
    url_nagoya = resolve_source_url("Nagoya Protocol on Access and Benefit Sharing")
    assert "cbd.int" in url_nagoya

    # WIPO
    url_wipo = resolve_source_url("WIPO Traditional Knowledge & Genetic Resources")
    assert "wipo.int" in url_wipo

    # Fallback to IP India portal
    url_fallback = resolve_source_url("Unrecognized Local Journal 2023")
    assert url_fallback == "https://ipindia.gov.in"


def test_is_chunk_referenced_strict():
    """Ensure context chunks are ONLY cited if genuinely discussed in the answer."""
    answer = (
        "Under Section 3(p) of the Patents Act, 1970, an invention that is traditional knowledge is not patentable. "
        "The Traditional Knowledge Digital Library (TKDL) serves as defensive prior art."
    )

    chunk_cited_1 = {"source": "The Patents Act, 1970 (Section 3(p))", "text": "Section 3(p) details..."}
    chunk_cited_2 = {"source": "Traditional Knowledge Digital Library (TKDL)", "text": "TKDL details..."}
    chunk_uncited = {"source": "Trade Marks Act, 1999 (Indian Patent Office)", "text": "Trademark registration rules..."}

    assert _is_chunk_referenced_in_answer(chunk_cited_1, answer) is True
    assert _is_chunk_referenced_in_answer(chunk_cited_2, answer) is True
    assert _is_chunk_referenced_in_answer(chunk_uncited, answer) is False


def test_extract_citations_deduplication_and_limit():
    """
    Ensure extracted citations deduplicate by source name, cap at 5, and truncate text to 300 chars.
    """
    answer = (
        "Discussing Section 3(p), Patents Act, TKDL, and Biological Diversity Act along with Charaka Samhita."
    )
    long_text = "A" * 500
    context_chunks = [
        {"id": "c1", "source": "The Patents Act, 1970 (Section 3(p))", "text": long_text, "jurisdiction": "india", "category": "ip_law", "confidence_tier": "primary_legislation"},
        {"id": "c2", "source": "The Patents Act, 1970 (Section 3(p))", "text": "Duplicate source", "jurisdiction": "india", "category": "ip_law", "confidence_tier": "primary_legislation"},
        {"id": "c3", "source": "Traditional Knowledge Digital Library (TKDL)", "text": long_text, "jurisdiction": "india", "category": "tkdl", "confidence_tier": "primary_legislation"},
        {"id": "c4", "source": "Biological Diversity Act, 2002", "text": long_text, "jurisdiction": "india", "category": "biodiversity", "confidence_tier": "primary_legislation"},
        {"id": "c5", "source": "Charaka Samhita", "text": long_text, "jurisdiction": "india", "category": "classical", "confidence_tier": "primary_legislation"},
    ]

    citations = extract_citations(answer, context_chunks)
    # Deduplication test: even though 2 chunks share "The Patents Act, 1970 (Section 3(p))", only 1 is cited
    sources = [c.source for c in citations]
    assert len(sources) == len(set(sources))

    # Text length truncation test: max length should be 303 chars (300 + '...')
    for citation in citations:
        assert len(citation.text) <= 303
        assert citation.url.startswith("http")
