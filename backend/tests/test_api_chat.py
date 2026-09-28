"""
Comprehensive tests for the /api/chat RAG endpoint.
Tests fast-path intent routing, full RAG generation, statutory alerts, streaming SSE,
input validation, and correlation-id traceability on degraded retrieval.
"""

import pytest
import json
import logging
from httpx import AsyncClient
from unittest.mock import AsyncMock


@pytest.mark.asyncio
async def test_chat_chit_chat_fast_path(async_client: AsyncClient, mock_nim_service):
    """
    Chit-chat queries like 'Hello' or 'Namaste' must bypass the vector search
    and heavy LLM generation, returning an immediate friendly greeting.
    """
    payload = {
        "query": "Hello, good morning!",
        "jurisdiction": "india",
        "language": "en",
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "IP-SAKTI Sahayak" in data["answer"]
    assert data["confidence"] == 1.0
    assert data["confidence_level"] == "high"
    assert data["citations"] == []
    # Verify RAG embedding was NOT called
    mock_nim_service.embed_single.assert_not_called()


@pytest.mark.asyncio
async def test_chat_irrelevant_query_fast_path(async_client: AsyncClient, mock_nim_service):
    """
    Irrelevant queries (e.g. coding requests, weather) must be deflected politely
    without calling the expensive RAG pipeline.
    """
    payload = {
        "query": "Write python code to reverse a linked list",
        "jurisdiction": "india",
        "language": "en",
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "only assist with Ayurveda" in data["answer"]
    assert data["citations"] == []
    mock_nim_service.embed_single.assert_not_called()


@pytest.mark.asyncio
async def test_chat_relevant_rag_query(async_client: AsyncClient, mock_nim_service, mock_qdrant_service):
    """
    Domain queries about patents and Ayurveda must execute the full RAG pipeline:
    query embedding, vector search, LLM generation, citation extraction, confidence scoring.
    """
    payload = {
        "query": "Can I patent a turmeric and neem formulation for wound healing in India?",
        "jurisdiction": "india",
        "language": "en",
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify RAG components were triggered
    assert mock_nim_service.embed_single.called
    assert mock_qdrant_service.search_across_collections.called

    assert "answer" in data and len(data["answer"]) > 0
    assert "Section 3(p)" in data["answer"]
    assert data["jurisdiction"] == "india"
    assert data["confidence"] > 0.0
    assert "disclaimer" in data

    # Verify citations are structured properly with verified URLs
    assert len(data["citations"]) > 0
    for citation in data["citations"]:
        assert "source" in citation
        assert "url" in citation
        assert citation["url"].startswith("http")


@pytest.mark.asyncio
async def test_chat_statutory_alert_detection(async_client: AsyncClient):
    """
    When an answer identifies Section 3(p) statutory patent bar / TKDL prior art conflicts,
    the response must attach a statutory_alert object with title and action guidance.
    """
    payload = {
        "query": "Is traditional turmeric paste patentable under Indian law?",
        "jurisdiction": "india",
        "language": "en",
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["statutory_alert"] is not None
    assert "Section 3(p)" in data["statutory_alert"]["title"]
    assert "Traditional Knowledge" in data["statutory_alert"]["description"]


@pytest.mark.asyncio
async def test_chat_streaming_sse(async_client: AsyncClient):
    """
    When stream=True, the endpoint must return a text/event-stream response
    with SSE data chunks, metadata, and [DONE] terminator.
    """
    payload = {
        "query": "Explain Section 3(p) of the Patents Act, 1970",
        "jurisdiction": "india",
        "language": "en",
        "stream": True,
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    events = []
    metadata_event = None
    has_done = False

    for line in response.text.split("\n\n"):
        line = line.strip()
        if not line.startswith("data:"):
            continue
        data_str = line[len("data:"):].strip()
        if data_str == "[DONE]":
            has_done = True
            break
        try:
            parsed = json.loads(data_str)
            if "chunk" in parsed:
                events.append(parsed["chunk"])
            elif "metadata" in parsed:
                metadata_event = parsed["metadata"]
        except json.JSONDecodeError:
            pass

    assert len(events) > 0
    assert metadata_event is not None
    assert "citations" in metadata_event
    assert "confidence" in metadata_event
    assert has_done is True


@pytest.mark.asyncio
async def test_chat_streaming_multilingual_returns_sse(async_client: AsyncClient):
    """
    Regression: a non-English query must still answer a streaming request with SSE.

    Translation needs the whole answer, so the pipeline generates in one shot; if it
    hands the bare ChatResponse back, the endpoint wraps a non-iterable in
    StreamingResponse and the request 500s — the UI then shows the thinking
    animation forever and never renders an answer.
    """
    payload = {
        "query": "Section 3(p) ke under traditional knowledge patentable hai?",
        "jurisdiction": "india",
        "language": "hi",
        "stream": True,
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    events, metadata_event, has_done = [], None, False
    for line in response.text.split("\n\n"):
        line = line.strip()
        if not line.startswith("data:"):
            continue
        data_str = line[len("data:"):].strip()
        if data_str == "[DONE]":
            has_done = True
            break
        parsed = json.loads(data_str)
        if "chunk" in parsed:
            events.append(parsed["chunk"])
        elif "metadata" in parsed:
            metadata_event = parsed["metadata"]

    assert "".join(events).startswith("[hi]"), "translated answer should stream as a chunk"
    assert metadata_event is not None
    assert "citations" in metadata_event
    assert has_done is True


@pytest.mark.asyncio
async def test_chat_streaming_multilingual_fast_path_returns_sse(async_client: AsyncClient):
    """
    Regression: the chit-chat fast path is also one-shot, so a non-English streaming
    greeting must return SSE rather than a JSON body the client cannot parse.
    """
    payload = {
        "query": "Namaste",
        "jurisdiction": "india",
        "language": "hi",
        "stream": True,
    }
    response = await async_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert "data: [DONE]" in response.text
    assert "IP-SAKTI Sahayak" in response.text


def test_sarvam_language_codes_are_region_tagged():
    """
    Regression: Sarvam rejects bare ISO codes with HTTP 400, which surfaced in the UI
    as a chat that streams forever and never answers.
    """
    from app.models.enums import Language
    from app.services.sarvam import sarvam_code

    assert sarvam_code(Language.ENGLISH) == "en-IN"
    assert sarvam_code(Language.HINDI) == "hi-IN"
    assert sarvam_code(Language.TAMIL) == "ta-IN"
    # Odia is the one code that does not follow the ISO two-letter prefix.
    assert sarvam_code(Language.ODIA) == "od-IN"

    for language in Language:
        code = sarvam_code(language)
        assert code.endswith("-IN") and code != "-IN", f"{language} maps to {code!r}"


def test_translation_splits_long_answers_at_the_limit():
    """
    Regression: Sarvam's mayura:v1 rejects inputs over 1000 characters, and RAG
    answers are far longer, so every translated reply used to fail and blank the chat.
    """
    from app.services.sarvam import SARVAM_MAX_CHARS, _split_within_limit

    # A short answer stays one request.
    assert _split_within_limit("Short answer.") == ["Short answer."]

    # A long markdown answer is chunked under the cap and rejoins byte-for-byte.
    paragraph = "Section 3(p) bars traditional knowledge from patentability. " * 20
    answer = "\n\n".join([f"## Heading {i}\n\n{paragraph}" for i in range(12)])
    assert len(answer) > SARVAM_MAX_CHARS * 3

    pieces = _split_within_limit(answer)
    assert all(len(piece) <= SARVAM_MAX_CHARS for piece in pieces)
    assert "".join(pieces) == answer
    # Cuts land on structure, not mid-word.
    assert all(piece.endswith(("\n\n", "\n", ". ", " ")) for piece in pieces[:-1])


@pytest.mark.asyncio
async def test_chat_validation_errors(async_client: AsyncClient):
    """
    Pydantic schema validation: reject empty query, oversized query, or invalid enum values.
    """
    # Empty query
    res = await async_client.post("/api/chat", json={"query": ""})
    assert res.status_code == 422

    # Query too long (>2000 chars)
    res = await async_client.post("/api/chat", json={"query": "A" * 2001})
    assert res.status_code == 422

    # Invalid jurisdiction
    res = await async_client.post("/api/chat", json={"query": "Valid query", "jurisdiction": "mars"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_chat_with_auth_header(async_client: AsyncClient, mock_supabase_service):
    """
    Verify chat request with Supabase JWT bearer token records session and message.
    """
    payload = {
        "query": "Hello",
        "jurisdiction": "india",
        "session_id": "test-session-123",
    }
    import time
    import jwt
    from app.config import settings
    settings.JWT_SECRET = "test-secret-key-123"
    token = jwt.encode(
        {"sub": "user_456", "aud": "authenticated", "exp": int(time.time()) + 3600},
        "test-secret-key-123",
        algorithm="HS256",
    )

    response = await async_client.post(
        "/api/chat",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert mock_supabase_service.save_message.called


@pytest.mark.asyncio
async def test_chat_degraded_rag_log_carries_correlation_id(
    async_client: AsyncClient, mock_nim_service, caplog
):
    """
    When retrieval degrades (empty embedding → Qdrant search skipped), the warning
    must carry the same correlation id the response echoes, so one grep ties the
    answer back to the request that produced it.
    """
    # Force the degraded branch: embedding returns nothing.
    mock_nim_service.embed_single = AsyncMock(return_value=[])

    request_id = "req-correlation-1"
    payload = {
        "query": "Is traditional turmeric paste patentable under Indian law?",
        "jurisdiction": "india",
        "language": "en",
    }
    with caplog.at_level(logging.WARNING, logger="app.rag"):
        response = await async_client.post(
            "/api/chat", json=payload, headers={"X-Request-Id": request_id}
        )

    assert response.status_code == 200
    # The server honours the caller's id and hands it back for client-side reports.
    assert response.headers["X-Request-Id"] == request_id

    degraded = [r for r in caplog.records if "Query embedding is empty" in r.getMessage()]
    assert len(degraded) == 1, "expected exactly one degraded-retrieval log line"
    record = degraded[0]

    # Bound to the RAG pipeline logger (not a stray uvicorn logger) and stamped
    # with the correlation id, both structured and in the rendered message text.
    assert record.name == "app.rag"
    assert record.request_id == request_id
    assert record.getMessage().startswith(f"[req={request_id}] ")
    assert f"[req={request_id}] Query embedding is empty" in caplog.text
    assert "Qdrant search skipped" in caplog.text
