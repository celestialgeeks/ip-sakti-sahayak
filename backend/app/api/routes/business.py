"""
Business Enablement API — funding eligibility matcher, supplier directory,
and label compliance checker.

All endpoints are deterministic and self-contained (no LLM). Responses embed the
official source citations and a standing disclaimer. Catalog-integrity failures
surface as 503 rather than silently returning empty results.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    FundingMatchRequest,
    FundingMatchResponse,
    LabelCheckRequest,
    LabelCheckResponse,
)
from app.core.funding_matcher import match_funding
from app.core.label_validator import check_label
from app.services import business_service as catalog
from app.services.business_service import DataIntegrityError

logger = logging.getLogger("app.api.business")
router = APIRouter()


def _guard():
    try:
        catalog.get_schemes()
    except DataIntegrityError as e:
        logger.error("Business catalog integrity failure: %s", e)
        raise HTTPException(
            status_code=503,
            detail={"error": "business_catalog_unavailable", "cause": str(e)},
        )


@router.post("/business/funding/match", response_model=FundingMatchResponse,
             summary="Match funding & loan schemes to an enterprise profile")
async def funding_match(request: FundingMatchRequest):
    """Return ranked Mudra / PMEGP / Stand-Up India / CGTMSE eligibility verdicts."""
    _guard()
    return match_funding(request)


@router.get("/business/schemes", summary="List the funding scheme catalog")
async def list_schemes():
    _guard()
    return {
        "disclaimer": catalog.schemes_disclaimer(),
        "schemes": [s.model_dump() for s in catalog.get_schemes()],
    }


@router.get("/business/suppliers", summary="Filterable raw-material supplier directory")
async def list_suppliers(
    q: str = Query("", max_length=120, description="Free-text match on name/material/state"),
    state: Optional[str] = Query(None, max_length=60),
    gi_only: bool = Query(False, description="Only GI-tagged suppliers"),
    certification: Optional[str] = Query(None, max_length=40, description="e.g. GMP, FSSAI, AYUSH"),
):
    _guard()
    try:
        suppliers = catalog.get_suppliers()
    except DataIntegrityError as e:
        raise HTTPException(status_code=503,
                            detail={"error": "business_catalog_unavailable", "cause": str(e)})

    ql = q.lower().strip()
    results: List[dict] = []
    for s in suppliers:
        if state and s.state.lower() != state.lower():
            continue
        if gi_only and not s.gi_tags:
            continue
        if certification and not any(certification.lower() in c.lower() for c in s.certifications):
            continue
        if ql:
            haystack = " ".join([s.name, s.region, s.state, " ".join(s.materials),
                                 " ".join(s.gi_tags)]).lower()
            if ql not in haystack:
                continue
        results.append(s.model_dump())

    return {
        "disclaimer": catalog.suppliers_disclaimer(),
        "total": len(results),
        "items": results,
    }


@router.post("/business/label/check", response_model=LabelCheckResponse,
             summary="Check a draft label against AYUSH / FSSAI labeling rules")
async def label_check(request: LabelCheckRequest):
    """Validate label text element-by-element against the statutory ruleset."""
    try:
        catalog.get_rulesets()
    except DataIntegrityError as e:
        logger.error("Labeling ruleset integrity failure: %s", e)
        raise HTTPException(
            status_code=503,
            detail={"error": "labeling_rules_unavailable", "cause": str(e)},
        )
    if request.ruleset and not catalog.get_ruleset(request.ruleset):
        raise HTTPException(status_code=400, detail={"error": "unknown_ruleset", "ruleset": request.ruleset})
    return check_label(request)
