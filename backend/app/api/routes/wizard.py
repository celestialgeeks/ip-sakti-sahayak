"""
Registration & Compliance Wizard — per-user progress persistence.

Progress is stored in the Supabase `wizard_states` table, keyed by the
authenticated user's id. Reads/writes are auth-guarded so a user can only
ever access their own state.
"""

import logging
from typing import List

from fastapi import APIRouter, Depends

from app.api.middleware.auth import get_current_user_id
from app.models.schemas import (
    WizardStateSaveRequest,
    WizardStateResponse,
    WizardStepState,
)
from app.services.supabase_service import supabase_service

logger = logging.getLogger("app.wizard")
router = APIRouter()


def _to_steps(steps: List[WizardStepState]) -> List[dict]:
    return [{"id": s.id, "status": s.status} for s in steps]


@router.get("/wizard/state", response_model=WizardStateResponse)
async def get_wizard_state(user_id: str = Depends(get_current_user_id)):
    """Return the signed-in user's saved wizard progress (empty default if none)."""
    state = await supabase_service.get_wizard_state(user_id)
    if state is None:
        return WizardStateResponse(user_id=user_id, current_step="eligibility", steps=[])
    return WizardStateResponse(user_id=user_id, **state)


@router.post("/wizard/state", response_model=WizardStateResponse)
async def save_wizard_state(
    request: WizardStateSaveRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Upsert the signed-in user's wizard progress and echo it back."""
    payload = {
        "current_step": request.current_step,
        "product_type": request.product_type,
        "classification": request.classification,
        "steps": _to_steps(request.steps),
        "answers": request.answers,
    }
    saved = await supabase_service.save_wizard_state(user_id, payload)
    steps = [WizardStepState(**s) for s in saved.get("steps", [])]
    return WizardStateResponse(
        user_id=user_id,
        current_step=saved.get("current_step", "eligibility"),
        product_type=saved.get("product_type"),
        classification=saved.get("classification"),
        steps=steps,
        answers=saved.get("answers"),
        updated_at=saved.get("updated_at"),
    )
