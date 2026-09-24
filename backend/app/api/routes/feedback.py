"""
User feedback endpoint — collect quality ratings on answers.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import FeedbackRequest
from app.services.sqlite_service import sqlite_service

logger = logging.getLogger("app.feedback")
router = APIRouter()

VALID_RATINGS = {"helpful", "not_helpful", "inaccurate"}


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit user feedback on an answer (helpful / not helpful / inaccurate).
    Persisted to the local SQLite audit store.
    """
    if request.rating not in VALID_RATINGS:
        raise HTTPException(
            status_code=422,
            detail=f"rating must be one of {sorted(VALID_RATINGS)}",
        )
    try:
        await sqlite_service.save_feedback(
            message_id=request.message_id,
            rating=request.rating,
            comment=request.comment,
        )
    except Exception as e:
        logger.error("Failed to persist feedback: %r", e)
        raise HTTPException(status_code=500, detail="Could not save feedback.") from e
    return {"status": "received", "message_id": request.message_id}
