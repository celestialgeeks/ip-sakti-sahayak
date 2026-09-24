"""
Comprehensive tests for the /api/chat RAG endpoint.
Tests fast-path intent routing, full RAG generation, statutory alerts, streaming SSE,
and input validation.
"""

import pytest
import json
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
