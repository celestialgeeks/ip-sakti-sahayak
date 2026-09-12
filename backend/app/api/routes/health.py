"""
Health check endpoint.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Returns service health status."""
    return {
        "status": "healthy",
        "service": "IP-SAKTI Sahayak",
        "version": "0.1.0",
    }
