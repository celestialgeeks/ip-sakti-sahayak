"""
Chat endpoint — Main RAG-powered conversation with streaming SSE responses.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.rag_pipeline import run_rag_pipeline
from app.models.schemas import ChatRequest

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Process a user query through the RAG pipeline.
    Returns a response with citations, confidence score, and jurisdiction context.
    """
    # Check if stream parameter is passed (could be query param or request body, we'll check request body or assume stream=True for SSE if client asks)
    # The client will send stream: true if it wants streaming.
    stream = getattr(request, "stream", False)
    
    result = await run_rag_pipeline(
        query=request.query,
        jurisdiction=request.jurisdiction,
        language=request.language,
        session_id=request.session_id,
        stream=stream,
    )
    
    if stream:
        return StreamingResponse(result, media_type="text/event-stream")
    return result
