"""
Formulation classification endpoint.
Determines product category: Classical, Proprietary, New Drug, Phytopharmaceutical, Aahar, Cosmetic.
"""

from fastapi import APIRouter

from app.models.schemas import ClassifyRequest, ClassifyResponse
from app.core.classifier import classify_formulation as do_classify

router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify_formulation(request: ClassifyRequest):
    """
    Classify an Ayurvedic formulation into its regulatory category.
    Returns the category, applicable IP protections, regulatory pathway, and ABS obligations.
    """
    return do_classify(
        formulation_name=request.formulation_name,
        description=request.description,
        ingredients=request.ingredients,
        is_in_authoritative_text=request.is_in_authoritative_text,
        intended_use=request.intended_use,
    )
