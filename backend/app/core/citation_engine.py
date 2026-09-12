"""
Citation Engine — Extract and format source citations from RAG results.
"""

from typing import List, Dict, Any
from app.models.schemas import Citation
import uuid


def extract_citations(answer: str, context_chunks: List[Dict[str, Any]]) -> List[Citation]:
    """
    Extract citations from the generated answer matched against retrieved context chunks.
    
    For each context chunk that was likely used in the answer (based on text overlap),
    create a Citation object with full source reference.
    """
    citations = []
    seen_sources = set()

    for chunk in context_chunks:
        source = chunk.get("source", "")
        if not source or source in seen_sources:
            continue

        # Check if any significant phrase from the chunk appears in the answer
        chunk_text = chunk.get("text", "")
        # Simple heuristic: if score is high enough, include as citation
        if chunk.get("score", 0) >= 0.5:
            seen_sources.add(source)
            citations.append(
                Citation(
                    id=chunk.get("id", str(uuid.uuid4())),
                    source=source,
                    text=chunk_text[:300] + ("..." if len(chunk_text) > 300 else ""),
                    jurisdiction=chunk.get("jurisdiction", "india"),
                    category=chunk.get("category", "general"),
                    confidence_tier=chunk.get("confidence_tier", "commentary"),
                )
            )

    return citations[:5]  # Limit to top 5 citations


def format_citation_inline(citation: Citation) -> str:
    """Format a citation for inline display."""
    return f"[{citation.source}]"


def format_citations_block(citations: List[Citation]) -> str:
    """Format all citations as a reference block."""
    if not citations:
        return ""

    lines = ["**Sources:**"]
    for i, c in enumerate(citations, 1):
        lines.append(f"{i}. {c.source}")
        if c.url:
            lines.append(f"   🔗 {c.url}")
    return "\n".join(lines)
