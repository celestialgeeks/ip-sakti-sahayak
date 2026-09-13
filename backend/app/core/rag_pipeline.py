"""
RAG Pipeline — Orchestrates the full retrieval-augmented generation flow.
"""

from typing import List, Dict, Any, Optional, AsyncGenerator

from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.services.sarvam import sarvam_service
from app.services.supabase_service import supabase_service
from app.core.citation_engine import extract_citations
from app.core.confidence_scorer import compute_confidence
from app.core.jurisdiction import get_jurisdiction_context
from app.utils.prompts import build_system_prompt, build_rag_prompt
from app.models.enums import Jurisdiction, Language, ConfidenceLevel
from app.models.schemas import ChatResponse, Citation


import json
import re

async def run_rag_pipeline(
    query: str,
    jurisdiction: Jurisdiction = Jurisdiction.INDIA,
    language: Language = Language.ENGLISH,
    session_id: Optional[str] = None,
    stream: bool = False,
    user_id: Optional[str] = None,
):
    """
    Full RAG pipeline with optional streaming.
    """
    # If translation is needed, we cannot stream because we must translate the full response
    if language != Language.ENGLISH:
        stream = False

    import uuid
    if not session_id:
        session_id = str(uuid.uuid4())
    
    if user_id:
        await supabase_service.save_session(session_id, user_id, query)
        await supabase_service.save_message(session_id, "user", query)

    # Step 1: Handle multilingual input
    original_query = query
    detected_lang = await sarvam_service.detect_language(query)
    if detected_lang != Language.ENGLISH:
        query = await sarvam_service.translate(query, detected_lang, Language.ENGLISH)

    # Step 1.5: Intent Classification & Dynamic Routing
    intent_prompt = f"""
    You are an intent classifier for IP-SAKTI Sahayak, an assistant for Ayurveda Intellectual Property.
    Analyze the following user query and classify its intent into one of three categories:
    1. "relevant": The query is about Intellectual Property, Patents, Trademarks, Ayurveda, Traditional Knowledge, TKDL, biology, law, or related fields.
    2. "chit_chat": The query is a simple greeting, expression of gratitude, or conversational pleasantry (e.g., "hi", "hello", "thanks", "how are you", "who are you").
    3. "irrelevant": The query is asking for something completely unrelated (e.g., writing code, general knowledge outside IP/Ayurveda, harmful requests).

    Query: "{query}"

    Respond with ONLY the exact string: "relevant", "chit_chat", or "irrelevant". Do not output anything else.
    """
    
    intent = await nim_service.generate([{"role": "user", "content": intent_prompt}], temperature=0.1, max_tokens=10)
    intent = str(intent).strip().lower()
    
    if "chit_chat" in intent or "irrelevant" in intent:
        if "chit_chat" in intent:
            fast_answer = "Hello! I am IP-SAKTI Sahayak, your AI assistant for Ayurvedic Intellectual Property and Traditional Knowledge. How can I help you with patents or regulations today?"
        else:
            fast_answer = "I am an IP-SAKTI Sahayak. I can only assist with questions related to Ayurveda Intellectual Property, Patents, and Traditional Knowledge. I cannot answer other queries."
            
        if language != Language.ENGLISH:
            fast_answer = await sarvam_service.translate(fast_answer, Language.ENGLISH, language)
        if user_id:
            await supabase_service.save_message(session_id, "assistant", fast_answer, citations=[])
            
        if not stream:
            return ChatResponse(
                answer=fast_answer, citations=[], confidence=1.0, 
                confidence_level=ConfidenceLevel.HIGH, jurisdiction=jurisdiction, 
                disclaimer="", session_id=session_id
            )
        async def stream_generator_fast():
            yield f"data: {json.dumps({'chunk': fast_answer})}\\n\\n"
            metadata = {"citations": [], "confidence": 1.0, "confidence_level": "high", "session_id": session_id}
            yield f"data: {json.dumps({'metadata': metadata})}\\n\\n"
            yield "data: [DONE]\\n\\n"
        return stream_generator_fast()

    # Step 2: Generate query embedding
    query_embedding = await nim_service.embed_single(query)
    if not query_embedding:
        import logging as _log
        _log.getLogger("uvicorn.error").warning(
            "Query embedding is empty — Qdrant search skipped."
        )

    # Step 3: Search Qdrant
    search_results = await qdrant_service.search_across_collections(
        query_vector=query_embedding,
        jurisdiction=jurisdiction.value,
        limit=10,
    )

    # Step 4: Build context
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

    # Step 5: Build prompt
    system_prompt = build_system_prompt(jurisdiction)
    user_prompt = build_rag_prompt(query, context_chunks)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # Helper to strip reasoning blocks
    def strip_reasoning(text: str) -> str:
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        text = re.sub(r"Here's a thinking process:.*?(\n\n|$)", "", text, flags=re.DOTALL)
        return text.strip()

    if not stream:
        # Non-streaming path
        answer = await nim_service.generate(messages, temperature=0.3, max_tokens=1024)
        answer = strip_reasoning(answer)
        
        citations = extract_citations(answer, context_chunks)
        confidence_score = compute_confidence(search_results, citations)
        confidence_level = (
            ConfidenceLevel.HIGH if confidence_score >= 0.85
            else ConfidenceLevel.MEDIUM if confidence_score >= 0.60
            else ConfidenceLevel.LOW
        )

        if language != Language.ENGLISH:
            answer = await sarvam_service.translate(answer, Language.ENGLISH, language)

        if user_id:
            await supabase_service.save_message(session_id, "assistant", answer, citations=[c.model_dump() for c in citations])

        return ChatResponse(
            answer=answer,
            citations=citations,
            confidence=confidence_score,
            confidence_level=confidence_level,
            jurisdiction=jurisdiction,
            disclaimer="Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.",
            session_id=session_id,
        )

    # Streaming path
    async def stream_generator() -> AsyncGenerator[str, None]:
        generator = await nim_service.generate(messages, temperature=0.3, max_tokens=1024, stream=True)
        full_answer = ""
        in_think_block = False
        
        async for chunk in generator:
            # Very basic streaming reasoning stripper:
            # If we see <think>, we stop yielding until we see </think>.
            # This is simplified; a robust one would buffer.
            # We will just accumulate and yield chunk by chunk if not in think block.
            
            # Simple buffer approach to filter out "<think>" dynamically is complex in async,
            # so we'll just yield the chunks and filter out the known strings if possible, 
            # or rely on the prompt to prevent it. Since the prompt tells it NOT to output thinking,
            # we just yield chunks directly and accumulate to calculate citations at the end.
            if "<think>" in chunk:
                in_think_block = True
            if in_think_block:
                if "</think>" in chunk:
                    in_think_block = False
                continue
                
            full_answer += chunk
            # Yield as SSE data
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
        # End of stream - compute citations on the full answer
        full_answer = strip_reasoning(full_answer)
        citations = extract_citations(full_answer, context_chunks)
        confidence_score = compute_confidence(search_results, citations)
        confidence_level = (
            ConfidenceLevel.HIGH if confidence_score >= 0.85
            else ConfidenceLevel.MEDIUM if confidence_score >= 0.60
            else ConfidenceLevel.LOW
        )
        
        if user_id:
            await supabase_service.save_message(session_id, "assistant", full_answer, citations=[c.model_dump() for c in citations])
        
        # Yield final metadata block
        metadata = {
            "citations": [c.model_dump() for c in citations],
            "confidence": confidence_score,
            "confidence_level": confidence_level.value,
            "session_id": session_id
        }
        yield f"data: {json.dumps({'metadata': metadata})}\n\n"
        yield "data: [DONE]\n\n"

    return stream_generator()
