"""
Formulation classification endpoint.
Determines product category: Classical, Proprietary, New Drug, Phytopharmaceutical, Aahar, Cosmetic.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.core.classifier import classify_formulation
from app.models.schemas import ClassifyRequest, ClassifyResponse

logger = logging.getLogger("app.classify")
router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify_formulation_endpoint(request: ClassifyRequest):
    """
    Classify an Ayurvedic formulation into its regulatory category.
    Returns the category, applicable IP protections, regulatory pathway, and ABS obligations.
    """
    try:
        return classify_formulation(
            formulation_name=request.formulation_name,
            description=request.description,
            ingredients=request.ingredients,
            is_in_authoritative_text=request.is_in_authoritative_text,
            intended_use=request.intended_use,
        )
    except Exception as e:
        logger.exception("Classification failed")
        raise HTTPException(status_code=500, detail="Classification failed. Please retry.") from e
