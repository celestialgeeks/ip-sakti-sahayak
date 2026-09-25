"""
Tests for the Registration & Compliance Wizard (/api/wizard/state).

Covers: auth guard (unauthenticated rejected), per-user state round-trip
(save then get), and the default-empty response when no state exists yet.
"""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.api.middleware.auth import get_current_user_id
from app.main import app


@pytest.mark.asyncio
async def test_wizard_state_requires_auth(async_client: AsyncClient):
    """Unauthenticated reads/writes are rejected with 401."""
    r_get = await async_client.get("/api/wizard/state")
    assert r_get.status_code == 401

    r_post = await async_client.post(
        "/api/wizard/state", json={"current_step": "udyam", "steps": []}
    )
    assert r_post.status_code == 401


@pytest.mark.asyncio
async def test_wizard_state_defaults_when_empty(async_client: AsyncClient):
    """A signed-in user with no saved state gets the eligibility default."""
    app.dependency_overrides[get_current_user_id] = lambda: "user-123"
    try:
        fake = MagicMock()
        fake.get_wizard_state = AsyncMock(return_value=None)
        with patch("app.api.routes.wizard.supabase_service", fake):
            r = await async_client.get("/api/wizard/state")
            assert r.status_code == 200
            data = r.json()
            assert data["user_id"] == "user-123"
            assert data["current_step"] == "eligibility"
            assert data["steps"] == []
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_wizard_state_roundtrip(async_client: AsyncClient):
    """Saving progress echoes back the persisted shape (license routing included)."""
    app.dependency_overrides[get_current_user_id] = lambda: "user-123"
    try:
        saved = {
            "current_step": "license",
            "product_type": "AYUSH",
            "classification": {"category": "proprietary"},
            "steps": [
                {"id": "eligibility", "status": "completed"},
                {"id": "classification", "status": "completed"},
                {"id": "udyam", "status": "completed"},
                {"id": "license", "status": "in_progress"},
            ],
            "answers": {"stage": "commercialize", "isAyurvedic": True},
            "updated_at": None,
        }
        fake = MagicMock()
        fake.save_wizard_state = AsyncMock(return_value=saved)
        with patch("app.api.routes.wizard.supabase_service", fake):
            payload = {
                "current_step": "license",
                "product_type": "AYUSH",
                "classification": {"category": "proprietary"},
                "steps": saved["steps"],
                "answers": saved["answers"],
            }
            r = await async_client.post("/api/wizard/state", json=payload)
            assert r.status_code == 200
            data = r.json()
            assert data["current_step"] == "license"
            assert data["product_type"] == "AYUSH"
            assert data["steps"][3]["status"] == "in_progress"
            # service was called with the authenticated user id
            assert fake.save_wizard_state.await_args.args[0] == "user-123"
    finally:
        app.dependency_overrides.clear()
