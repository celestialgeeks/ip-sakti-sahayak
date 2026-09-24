"""
Document ingestion endpoint — add documents to the knowledge corpus.

Requires an authenticated user (verified Supabase JWT). Supports TXT, PDF
and DOCX uploads: text is extracted, structure-aware chunked, embedded via
NVIDIA NIM and upserted into Qdrant with provenance metadata.
"""

import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.api.middleware.auth import get_current_user_id
from app.models.enums import QdrantCollection
from app.config import settings
from app.services.nvidia_nim import nim_service
from app.services.qdrant_service import qdrant_service
from app.utils.text_processing import chunk_text_structure_aware

logger = logging.getLogger("app.ingest")
router = APIRouter()

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


async def _extract_text(filename: str, blob: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        import fitz  # PyMuPDF

        doc = fitz.open(stream=blob, filetype="pdf")
        try:
            return "\n\n".join(page.get_text() for page in doc)
        finally:
            doc.close()
    if name.endswith(".docx"):
        import io

        from docx import Document

        document = Document(io.BytesIO(blob))
        return "\n\n".join(p.text for p in document.paragraphs if p.text.strip())
    # Default: plain text
    return blob.decode("utf-8", errors="replace")


@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    collection: str = Form(...),
    jurisdiction: str = Form("india"),
    category: str = Form("general"),
    source_citation: Optional[str] = Form(None),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Ingest a document (PDF/DOCX/TXT) into the Qdrant knowledge corpus.
    Chunks the document, generates embeddings, and stores with metadata.
    """
    if collection not in {c.value for c in QdrantCollection}:
        raise HTTPException(status_code=422, detail=f"Unknown collection '{collection}'.")
    if not settings.NVIDIA_NIM_API_KEY:
        raise HTTPException(status_code=503, detail="Embedding service not configured.")

    blob = await file.read(MAX_FILE_BYTES + 1)
    if len(blob) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit.")

    try:
        text = await _extract_text(file.filename, blob)
    except Exception as e:
        logger.error("Text extraction failed for %s: %r", file.filename, e)
        raise HTTPException(status_code=422, detail="Could not extract text from file.") from e

    chunks = chunk_text_structure_aware(
        text=text,
        chunk_size=settings.RAG_CHUNK_SIZE,
        chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        metadata={
            "source": source_citation or (file.filename or "upload"),
            "jurisdiction": jurisdiction,
            "category": category,
            "confidence_tier": "uploaded",
            "filename": file.filename or "upload",
            "uploaded_by": current_user_id,
        },
    )
    if not chunks:
        raise HTTPException(status_code=422, detail="No usable text found in document.")

    vectors = await nim_service.embed([c["text"] for c in chunks])
    if not vectors or len(vectors) != len(chunks):
        raise HTTPException(status_code=502, detail="Embedding generation failed.")

    ids = [str(uuid.uuid4()) for _ in chunks]
    payloads = [{k: v for k, v in c.items() if k != "id"} for c in chunks]
    try:
        await qdrant_service.upsert_documents(collection, ids, vectors, payloads)
    except Exception as e:
        logger.error("Qdrant upsert failed: %r", e)
        raise HTTPException(status_code=502, detail="Vector store write failed.") from e

    logger.info("Ingested %s: %d chunks -> %s", file.filename, len(chunks), collection)
    return {
        "status": "ingested",
        "filename": file.filename,
        "collection": collection,
        "chunks": len(chunks),
    }
