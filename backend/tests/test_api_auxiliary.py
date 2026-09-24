"""
Tests for auxiliary endpoints: /api/translate, /api/feedback, /api/sources, and /api/ingest.
"""

import pytest
import io
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_translate_endpoint(async_client: AsyncClient):
    """Ensure /api/translate accepts translation payload and responds with translated text."""
    payload = {
        "text": "What are the rules for patenting Ayurvedic herbal formulations?",
        "source_language": "en",
        "target_language": "hi",
    }
    response = await async_client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert data["source_language"] == "en"
    assert data["target_language"] == "hi"


@pytest.mark.asyncio
async def test_feedback_submission(async_client: AsyncClient):
    """Ensure /api/feedback stores ratings and comments."""
    payload = {
        "message_id": "msg_abc123",
        "rating": "helpful",
        "comment": "Accurately cited Section 3(p) and TKDL prior art.",
    }
    response = await async_client.post("/api/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "received"
    assert data["message_id"] == "msg_abc123"


@pytest.mark.asyncio
async def test_sources_not_found(async_client: AsyncClient):
    """Ensure /api/sources/{id} returns 404 for unknown citation IDs."""
    response = await async_client.get("/api/sources/non_existent_source_999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_ingest_document(async_client: AsyncClient):
    """Ensure /api/ingest handles multipart document uploads."""
    file_content = b"Sample Gazette Notification regarding ASU licensing under D&C Act Rule 158-B."
    files = {
        "file": ("gazette_notification.txt", io.BytesIO(file_content), "text/plain"),
    }
    data = {
        "collection": "india_regulatory",
        "jurisdiction": "india",
        "category": "regulatory",
        "source_citation": "Official Gazette Notification 2024",
    }
    response = await async_client.post("/api/ingest", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "ingested"
    assert res_data["filename"] == "gazette_notification.txt"
    assert res_data["collection"] == "india_regulatory"
