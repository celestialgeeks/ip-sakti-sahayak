"""
ABS (Access and Benefit Sharing) compliance checker endpoint.
"""

from fastapi import APIRouter

from app.models.schemas import ABSCheckRequest, ABSCheckResponse
from app.core.abs_helper import check_abs_compliance

router = APIRouter()


@router.post("/abs-check", response_model=ABSCheckResponse)
async def abs_compliance_check(request: ABSCheckRequest):
    """
    Check ABS compliance requirements for a given biological resource / formulation.
    Returns checklist items, NBA/SBB requirements, and application guidance.
    """
    return check_abs_compliance(
        biological_resource=request.biological_resource,
        source_location=request.source_location,
        commercial_use=request.commercial_use,
        involves_traditional_knowledge=request.involves_traditional_knowledge,
    )
