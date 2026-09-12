"""
RAG Pipeline — Orchestrates the full retrieval-augmented generation flow.
"""

from typing import List, Dict, Any, Optional, AsyncGenerator

from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.services.sarvam import sarvam_service
from app.core.citation_engine import extract_citations
from app.core.confidence_scorer import compute_confidence
from app.core.jurisdiction import get_jurisdiction_context
from app.utils.prompts import build_system_prompt, build_rag_prompt
from app.models.enums import Jurisdiction, Language, ConfidenceLevel
from app.models.schemas import ChatResponse, Citation


async def run_rag_pipeline(
    query: str,
    jurisdiction: Jurisdiction = Jurisdiction.INDIA,
    language: Language = Language.ENGLISH,
    session_id: Optional[str] = None,
) -> ChatResponse:
    """
    Full RAG pipeline:
    1. Language detection & translation (if non-English)
    2. Generate query embedding
    3. Search Qdrant (filtered by jurisdiction)
    4. Build context from retrieved documents
    5. Generate answer via NIM LLM
    6. Extract citations & compute confidence
    7. Translate response back (if needed)
    8. Attach disclaimer
    """
    # Step 1: Handle multilingual input
    original_query = query
    detected_lang = await sarvam_service.detect_language(query)
    if detected_lang != Language.ENGLISH:
        query = await sarvam_service.translate(query, detected_lang, Language.ENGLISH)

    # Step 2: Generate query embedding
    query_embedding = await nim_service.embed_single(query)

    # Step 3: Search Qdrant across relevant collections
    search_results = qdrant_service.search_across_collections(
        query_vector=query_embedding,
        jurisdiction=jurisdiction.value,
        limit=10,
    )

    # Step 4: Build context from results
    context_chunks = []
    for result in search_results:
        context_chunks.append({
            "text": result["text"],
            "source": result["source"],
            "score": result["score"],
            "jurisdiction": result["jurisdiction"],
            "category": result["category"],
            "confidence_tier": result["confidence_tier"],
            "id": result["id"],
        })

    # Step 5: Build prompt and generate response
    system_prompt = build_system_prompt(jurisdiction)
    user_prompt = build_rag_prompt(query, context_chunks)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    answer = await nim_service.generate(messages, temperature=0.3, max_tokens=1024)

    # Step 6: Extract citations and compute confidence
    citations = extract_citations(answer, context_chunks)
    confidence_score = compute_confidence(search_results, citations)
    confidence_level = (
        ConfidenceLevel.HIGH if confidence_score >= 0.85
        else ConfidenceLevel.MEDIUM if confidence_score >= 0.60
        else ConfidenceLevel.LOW
    )

    # Step 7: Translate response if needed
    if language != Language.ENGLISH:
        answer = await sarvam_service.translate(answer, Language.ENGLISH, language)

    # Step 8: Build response
    return ChatResponse(
        answer=answer,
        citations=citations,
        confidence=confidence_score,
        confidence_level=confidence_level,
        jurisdiction=jurisdiction,
        disclaimer="Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.",
        session_id=session_id,
    )
