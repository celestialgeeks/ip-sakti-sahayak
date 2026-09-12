"""
User feedback endpoint — collect quality ratings on answers.
"""

from fastapi import APIRouter

from app.models.schemas import FeedbackRequest

router = APIRouter()


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit user feedback on an answer (helpful / not helpful / inaccurate).
    """
    # TODO: Store feedback in SQLite
    return {"status": "received", "message_id": request.message_id}
