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
    return await run_rag_pipeline(
        query=request.query,
        jurisdiction=request.jurisdiction,
        language=request.language,
        session_id=request.session_id,
    )
