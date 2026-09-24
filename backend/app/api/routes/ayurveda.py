"""
Ayurvedic Library API — curated plants, formulations, conditions.

All responses embed a `disclaimer` field (educational reference, not medical
advice). Data-integrity failures surface as 503 with an explicit error rather
than silently returning empty results.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Path as PathParam, Query
from pydantic import BaseModel

from app.services.ayurveda_service import (
    DataIntegrityError,
    get_library,
)

logger = logging.getLogger("app.api.ayurveda")

router = APIRouter()

DISCLAIMER = (
    "Educational reference compiled from classical Ayurvedic texts and standard "
    "pharmacopoeial literature. NOT medical or legal advice; consult qualified "
    "AYUSH practitioners and registered patent agents for decisions."
)


def _library_or_503():
    try:
        return get_library()
    except DataIntegrityError as e:
        logger.error("Ayurveda library data integrity failure: %s", e)
        raise HTTPException(
            status_code=503,
            detail={"error": "ayurveda_library_unavailable", "cause": str(e)},
        )


class ErrorResponse(BaseModel):
    error: str
    cause: str = ""


class SearchResponse(BaseModel):
    query: str
    disclaimer: str
    total: int
    page: int
    page_size: int
    results: list[dict]


@router.get("/ayurveda/stats", summary="Library statistics",
            responses={503: {"model": ErrorResponse}})
async def library_stats():
    lib = _library_or_503()
    return {**lib.stats(), "disclaimer": DISCLAIMER}


@router.get("/ayurveda/search", summary="Relevance-ranked cross-entity search",
            response_model=SearchResponse)
async def search(
    q: str = Query("", max_length=200, description="Free-text query (Sanskrit, botanical, English or vernacular names, uses)"),
    type: list[str] = Query(default=[], description="Filter entity types: plant | formulation | condition"),
    dosha: Optional[str] = Query(None, pattern="^(?i)(vata|pitta|kapha)$"),
    rasa: Optional[str] = Query(None, max_length=40),
    virya: Optional[str] = Query(None, max_length=40),
    page: int = Query(1, ge=1, le=50),
    page_size: int = Query(20, ge=1, le=50),
):
    lib = _library_or_503()
    results, total = lib.search(q or "", types=list(type) or None,
                                dosha=dosha, rasa=rasa, virya=virya,
                                page=page, page_size=page_size)
    return {"query": q, "disclaimer": DISCLAIMER, "total": total,
            "page": page, "page_size": page_size, "results": results}


@router.get("/ayurveda/plants", summary="Browse/filter plants")
async def list_plants(
    dosha: Optional[str] = Query(None, pattern="^(?i)(vata|pitta|kapha)$"),
    rasa: Optional[str] = Query(None, max_length=40),
    virya: Optional[str] = Query(None, max_length=40),
    family: Optional[str] = Query(None, max_length=60),
    page: int = Query(1, ge=1, le=50),
    page_size: int = Query(20, ge=1, le=50),
):
    lib = _library_or_503()
    items, total = lib.filter_plants(dosha=dosha, rasa=rasa, virya=virya,
                                     family=family, page=page, page_size=page_size)
    return {"disclaimer": DISCLAIMER, "total": total, "page": page,
            "page_size": page_size, "items": items}


@router.get("/ayurveda/plants/{plant_id}", summary="Plant monograph",
            responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def get_plant(plant_id: str = PathParam(..., max_length=80)):
    lib = _library_or_503()
    plant = lib.get_plant(plant_id)
    if not plant:
        raise HTTPException(status_code=404,
                            detail={"error": "plant_not_found", "id": plant_id})
    return {"disclaimer": DISCLAIMER,
            "plant": plant.model_dump(),
            "related": lib.related("plant", plant.id)}


@router.get("/ayurveda/formulations", summary="Browse formulations")
async def list_formulations(
    type: Optional[str] = Query(None, max_length=30),
    category: Optional[str] = Query(None, max_length=30),
    page: int = Query(1, ge=1, le=50),
    page_size: int = Query(20, ge=1, le=50),
):
    lib = _library_or_503()
    items = lib.formulations
    if type:
        items = [f for f in items if type.lower() in f.type.lower()]
    if category:
        items = [f for f in items if category.lower() in f.category.lower()]
    total = len(items)
    start = (page - 1) * page_size
    return {"disclaimer": DISCLAIMER, "total": total, "page": page,
            "page_size": page_size,
            "items": [{"id": f.id, "name": f.name, "type": f.type,
                       "category": f.category} for f in items[start:start + page_size]]}


@router.get("/ayurveda/formulations/{formulation_id}", summary="Formulation monograph",
            responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def get_formulation(formulation_id: str = PathParam(..., max_length=80)):
    lib = _library_or_503()
    form = lib.get_formulation(formulation_id)
    if not form:
        raise HTTPException(status_code=404,
                            detail={"error": "formulation_not_found", "id": formulation_id})
    ingredients = [p.model_dump() for p in
                   (lib.get_plant(pid) for pid in form.ingredients) if p]
    return {"disclaimer": DISCLAIMER,
            "formulation": form.model_dump(),
            "ingredient_details": ingredients,
            "related": lib.related("formulation", form.id)}


@router.get("/ayurveda/conditions", summary="Browse conditions")
async def list_conditions(page: int = Query(1, ge=1, le=50),
                          page_size: int = Query(20, ge=1, le=50)):
    lib = _library_or_503()
    total = len(lib.conditions)
    start = (page - 1) * page_size
    return {"disclaimer": DISCLAIMER, "total": total, "page": page,
            "page_size": page_size,
            "items": [{"id": c.id, "name": c.name, "sanskrit_name": c.sanskrit_name,
                       "modern_equivalents": c.modern_equivalents}
                      for c in lib.conditions[start:start + page_size]]}


@router.get("/ayurveda/conditions/{condition_id}", summary="Condition entry",
            responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def get_condition(condition_id: str = PathParam(..., max_length=80)):
    lib = _library_or_503()
    cond = lib.get_condition(condition_id)
    if not cond:
        raise HTTPException(status_code=404,
                            detail={"error": "condition_not_found", "id": condition_id})
    return {"disclaimer": DISCLAIMER,
            "condition": cond.model_dump(),
            "related": lib.related("condition", cond.id)}
