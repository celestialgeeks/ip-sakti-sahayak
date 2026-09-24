"""
Chat endpoint — Main RAG-powered conversation with streaming SSE responses.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.rag_pipeline import run_rag_pipeline
from app.models.schemas import ChatRequest
from app.api.middleware.auth import get_optional_user_id

logger = logging.getLogger("app.chat")
router = APIRouter()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user_id: Optional[str] = Depends(get_optional_user_id),
):
    """
    Process a user query through the RAG pipeline.
    Returns a response with citations, confidence score, and jurisdiction context.
    Pass {"stream": true} for an SSE token stream.
    """
    stream = bool(getattr(request, "stream", False))

    result = await run_rag_pipeline(
        query=request.query,
        jurisdiction=request.jurisdiction,
        language=request.language,
        session_id=request.session_id,
        stream=stream,
        user_id=current_user_id,
    )

    if stream:
        return StreamingResponse(result, media_type="text/event-stream")
    return result
