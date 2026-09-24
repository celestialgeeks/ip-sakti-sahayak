"""
Tests for /api/health and /api/stats endpoints.
"""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Ensure service health check returns 200 and correct payload."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "IP-SAKTI Sahayak"
    assert "version" in data


@pytest.mark.asyncio
async def test_stats_endpoint(async_client: AsyncClient):
    """Ensure /api/stats returns indexed vector stats and resolves coroutine."""
    response = await async_client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["indexed_points"] == 1420
    assert data["estimated_documents"] == 142
    assert "confidence" in data
    assert "%" in data["confidence"]


@pytest.mark.asyncio
async def test_stats_endpoint_empty_db(async_client: AsyncClient, mock_qdrant_service):
    """Ensure /api/stats gracefully handles zero indexed points."""
    mock_qdrant_service.get_collection_stats = AsyncMock(
        return_value={"total_points": 0, "estimated_documents": 0}
    )
    response = await async_client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["indexed_points"] == 0
    assert data["estimated_documents"] == 0
