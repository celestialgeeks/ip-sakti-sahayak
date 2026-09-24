"""
RAG Pipeline — Orchestrates the full retrieval-augmented generation flow.
"""

from typing import List, Dict, Any, Optional, AsyncGenerator

from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.services.sarvam import sarvam_service
from app.services.supabase_service import supabase_service
from app.services.sqlite_service import sqlite_service
from app.core.citation_engine import extract_citations
from app.core.confidence_scorer import compute_confidence
from app.core.jurisdiction import get_jurisdiction_context
from app.utils.prompts import build_system_prompt, build_rag_prompt
from app.models.enums import Jurisdiction, Language, ConfidenceLevel
from app.models.schemas import ChatResponse, Citation


import json
import logging
import re

logger = logging.getLogger("app.rag")

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
    # Stage 1: Fast keyword pre-filter (no LLM cost)
    _q_lower = query.strip().lower()
    _chit_chat_triggers = {
        "hi", "hello", "hey", "hii", "hiii", "namaste", "good morning", "good evening",
        "good afternoon", "good night", "thanks", "thank you", "thank you so much",
        "thx", "ty", "ok", "okay", "great", "nice", "cool", "got it", "understood",
        "who are you", "what are you", "how are you", "what can you do", "help me"
    }
    _irrelevant_triggers = {
        "write code", "python code", "javascript", "html code", "sort a list",
        "recipe", "cricket score", "weather", "movie", "song", "joke",
        "stock price", "share market", "crypto", "bitcoin",
    }

    if _q_lower in _chit_chat_triggers or any(_q_lower.startswith(t) for t in _chit_chat_triggers):
        intent = "chit_chat"
    elif any(t in _q_lower for t in _irrelevant_triggers):
        intent = "irrelevant"
    else:
        # Stage 2: LLM classifier only for ambiguous queries
        intent_prompt = f"""You are a strict intent classifier for IP-SAKTI Sahayak, an Ayurveda IP assistant.
Classify the query into exactly one label. Respond with ONLY the label word, nothing else.

Labels:
- relevant: about IP, Patents, Trademarks, Ayurveda, Traditional Knowledge, TKDL, herbs, formulations, law, biodiversity
- chit_chat: greeting, gratitude, pleasantry, or identity question
- irrelevant: unrelated to Ayurveda/IP (coding help, general facts, entertainment, harmful)

Query: "{query}"
Label:"""
        intent = await nim_service.generate(
            [{"role": "user", "content": intent_prompt}],
            temperature=0.0, max_tokens=5
        )
        intent = str(intent).strip().lower().split()[0] if intent else "relevant"
        # Normalise any variation
        if intent not in ("relevant", "chit_chat", "irrelevant"):
            intent = "relevant"

    if intent in ("chit_chat", "irrelevant"):
        if intent == "chit_chat":
            fast_answer = "Hello! I am IP-SAKTI Sahayak, your AI assistant for Ayurvedic Intellectual Property and Traditional Knowledge. How can I help you with patents, TKDL, or regulations today?"
        else:
            fast_answer = "I am IP-SAKTI Sahayak — I can only assist with Ayurveda Intellectual Property, Patents, Traditional Knowledge, and related legal matters. I cannot answer other queries."
            
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
            yield f"data: {json.dumps({'chunk': fast_answer})}\n\n"
            metadata = {"citations": [], "confidence": 1.0, "confidence_level": "high", "session_id": session_id}
            yield f"data: {json.dumps({'metadata': metadata})}\n\n"
            yield "data: [DONE]\n\n"
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

    # Helper to strip reasoning blocks and planning echoes
    def strip_reasoning(text: str) -> str:
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        text = re.sub(r"Here's a thinking process:.*?(?=\n\n(?:###|[A-Z]|\d+\.\s+\*\*)|$)", "", text, flags=re.DOTALL)
        text = re.sub(r"^\s*1\.\s+\*\*Analyze User Request:\*\*.*?(?=\n\n(?:###|[A-Z])|$)", "", text, flags=re.DOTALL)
        return text.strip()

    def detect_statutory_alert(answer_text: str) -> Optional[Dict[str, str]]:
        """Precision detection: only trigger statutory alert if Section 3(p) objection is genuinely identified."""
        lower_ans = answer_text.lower()
        has_3p = bool(re.search(r"section\s*3\s*\(\s*p\s*\)|3\s*\(\s*p\s*\)", lower_ans))
        has_objection = bool(re.search(
            r"\b(objection|bar|bars|prohibited|not patentable|anticipat|traditional knowledge prior art|lack of novelty|refusal|section 25)\b",
            lower_ans
        ))
        if has_3p and has_objection:
            return {
                "title": "Statutory Alert: Section 3(p) / TKDL Prior Art Detected",
                "description": "This formulation intersects with documented Traditional Knowledge and faces objection under Section 3(p) of the Patents Act, 1970. Review TKDL citations and provide non-obvious synergistic efficacy data.",
            }
        return None

    if not stream:
        # Non-streaming path with 8192 max tokens
        answer = await nim_service.generate(messages, temperature=0.2, max_tokens=8192)
        answer = strip_reasoning(answer)
        
        citations = extract_citations(answer, context_chunks)
        confidence_score = compute_confidence(search_results, citations)
        confidence_level = (
            ConfidenceLevel.HIGH if confidence_score >= 0.85
            else ConfidenceLevel.MEDIUM if confidence_score >= 0.60
            else ConfidenceLevel.LOW
        )
        statutory_alert = detect_statutory_alert(answer)

        if language != Language.ENGLISH:
            answer = await sarvam_service.translate(answer, Language.ENGLISH, language)

        if user_id:
            await supabase_service.save_message(session_id, "assistant", answer, citations=[c.model_dump() for c in citations])

        try:
            await sqlite_service.log_query(
                session_id=session_id,
                query=query,
                jurisdiction=jurisdiction.value,
                language=language.value,
                confidence=confidence_score,
                citations_count=len(citations),
            )
        except Exception as e:
            logger.warning("Audit log write failed: %r", e)

        return ChatResponse(
            answer=answer,
            citations=citations,
            confidence=confidence_score,
            confidence_level=confidence_level,
            jurisdiction=jurisdiction,
            disclaimer="Verified against Ministry of Ayush & TKDL digital archives. Validate with registered patent attorneys.",
            session_id=session_id,
            statutory_alert=statutory_alert,
        )

    # Streaming path with smart preamble buffering
    async def stream_generator() -> AsyncGenerator[str, None]:
        generator = await nim_service.generate(messages, temperature=0.2, max_tokens=8192, stream=True)
        full_answer = ""
        buffer = ""
        in_think_block = False
        thinking_cleared = False
        
        async for chunk in generator:
            full_answer += chunk

            # If still checking initial stream for thinking preambles
            if not thinking_cleared:
                buffer += chunk

                if "<think>" in buffer:
                    in_think_block = True
                
                if in_think_block:
                    if "</think>" in buffer:
                        # Extract everything after </think>
                        after_think = buffer.split("</think>", 1)[1]
                        in_think_block = False
                        thinking_cleared = True
                        buffer = after_think.lstrip()
                        if buffer:
                            yield f"data: {json.dumps({'chunk': buffer})}\n\n"
                    continue

                # Check if buffer starts with "Here's a thinking process:" or "1. **Analyze"
                if re.search(r"Here's a thinking process:|1\.\s+\*\*Analyze User Request", buffer, re.IGNORECASE):
                    # Keep accumulating in buffer until thinking section ends
                    match = re.search(r"\n\n(###\s+|[A-Z][a-z]+|\*\*Executive Summary|\*\*Statutory)", buffer)
                    if match:
                        clean_content = buffer[match.start():].lstrip()
                        thinking_cleared = True
                        if clean_content:
                            yield f"data: {json.dumps({'chunk': clean_content})}\n\n"
                    continue

                # If buffer reached 120 chars and has no thinking pattern, flush and stream directly
                if len(buffer) >= 120:
                    thinking_cleared = True
                    yield f"data: {json.dumps({'chunk': buffer})}\n\n"
                    buffer = ""
            else:
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
        # Flush any remaining buffer if never cleared
        if not thinking_cleared and buffer:
            cleaned = strip_reasoning(buffer)
            if cleaned:
                yield f"data: {json.dumps({'chunk': cleaned})}\n\n"

        # End of stream - compute citations and alerts on the sanitized full answer
        sanitized_full = strip_reasoning(full_answer)
        citations = extract_citations(sanitized_full, context_chunks)
        confidence_score = compute_confidence(search_results, citations)
        confidence_level = (
            ConfidenceLevel.HIGH if confidence_score >= 0.85
            else ConfidenceLevel.MEDIUM if confidence_score >= 0.60
            else ConfidenceLevel.LOW
        )
        statutory_alert = detect_statutory_alert(sanitized_full)
        
        if user_id:
            await supabase_service.save_message(session_id, "assistant", sanitized_full, citations=[c.model_dump() for c in citations])
        
        # Yield final metadata block
        metadata = {
            "citations": [c.model_dump() for c in citations],
            "confidence": confidence_score,
            "confidence_level": confidence_level.value,
            "session_id": session_id,
            "statutory_alert": statutory_alert,
        }
        yield f"data: {json.dumps({'metadata': metadata})}\n\n"
        yield "data: [DONE]\n\n"

    return stream_generator()
