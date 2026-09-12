"""
Source retrieval endpoint — returns full source document for a citation.
"""

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/sources/{source_id}")
async def get_source(source_id: str):
    """
    Retrieve the full source document/chunk for a given citation ID.
    """
    # TODO: Look up source in Qdrant by ID
    raise HTTPException(status_code=404, detail=f"Source '{source_id}' not found.")
