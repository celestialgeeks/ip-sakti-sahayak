"""
Formulation Classifier — Determines regulatory category of an Ayurvedic product.
"""

from app.models.enums import FormulationCategory
from app.models.schemas import ClassifyResponse


def classify_formulation(
    formulation_name: str,
    description: str = "",
    ingredients: list[str] = [],
    is_in_authoritative_text: bool | None = None,
    intended_use: str = "",
) -> ClassifyResponse:
    """
    Classify an Ayurvedic formulation into its regulatory category.
    
    Decision tree:
    1. In First Schedule authoritative text? → Classical/Generic
    2. Proprietary combination not in texts? → Patent/Proprietary
    3. Novel claims requiring clinical proof? → New Drug
    4. Standardized plant extract, new drug app? → Phytopharmaceutical
    5. Positioned as food/supplement? → Ayurveda-Aahar
    6. Cosmetic application? → Cosmetic
    """
    # TODO: Implement LLM-assisted classification with RAG
    # For now, simple rule-based classification
    
    if is_in_authoritative_text is True:
        return ClassifyResponse(
            category=FormulationCategory.CLASSICAL,
            description="Classical/generic medicine from an authoritative text (First Schedule).",
            ip_protections=[
                "Limited patent scope (§3(p) bar on traditional knowledge)",
                "Trademark on brand name possible",
                "GI possible if geographically linked",
                "TKDL defensive protection",
            ],
            regulatory_pathway="ASU drug license under D&C Act, Schedule T compliance",
            abs_obligations="May require NBA intimation if using biological resources commercially",
            tkdl_implications="Formulation likely documented in TKDL. Check for prior art before patent filing.",
        )

    if is_in_authoritative_text is False and intended_use.lower() in ("therapeutic", "medicinal", "drug"):
        return ClassifyResponse(
            category=FormulationCategory.PROPRIETARY,
            description="Patent/proprietary Ayurvedic medicine (not in authoritative texts).",
            ip_protections=[
                "Patent possible for novel composition/process",
                "Trademark protection for brand",
                "Trade secret for proprietary formula",
            ],
            regulatory_pathway="Proprietary medicine license under D&C Act Rule 158-B",
            abs_obligations="NBA approval required for commercial use of biological resources",
            tkdl_implications="Cross-check ingredients against TKDL to assess §3(p) risk.",
        )

    return ClassifyResponse(
        category=FormulationCategory.UNKNOWN,
        description="Unable to classify. Please provide more details about the formulation.",
        ip_protections=[],
        regulatory_pathway="",
        abs_obligations="",
        tkdl_implications="",
    )
