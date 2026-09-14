"""
Pydantic schemas for request/response models.
"""

from pydantic import BaseModel, Field
from typing import List, Optional

from app.models.enums import Jurisdiction, ConfidenceLevel, FormulationCategory, Language


# ─── Chat ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Chat query request."""
    query: str = Field(..., min_length=1, max_length=2000, description="User's question")
    jurisdiction: Jurisdiction = Field(default=Jurisdiction.INDIA, description="Jurisdiction scope")
    language: Language = Field(default=Language.ENGLISH, description="Response language")
    session_id: Optional[str] = Field(default=None, description="Session ID for conversation history")
    stream: bool = Field(default=False, description="Enable streaming SSE response")


class Citation(BaseModel):
    """A source citation for an answer."""
    id: str = Field(..., description="Unique citation ID")
    source: str = Field(..., description="Full citation text (e.g., 'Patents Act 1970, §3(p)')")
    text: str = Field(..., description="Relevant excerpt from the source")
    jurisdiction: str = Field(..., description="india or international")
    category: str = Field(..., description="IP category")
    confidence_tier: str = Field(default="primary_legislation", description="Source authority tier")
    url: Optional[str] = Field(default=None, description="Link to source document")


class ChatResponse(BaseModel):
    """Chat query response with citations."""
    answer: str = Field(..., description="Generated response text")
    citations: List[Citation] = Field(default_factory=list, description="Source citations")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Answer confidence score")
    confidence_level: ConfidenceLevel = Field(default=ConfidenceLevel.LOW)
    jurisdiction: Jurisdiction = Field(default=Jurisdiction.INDIA)
    disclaimer: str = Field(
        default="This is information, not legal advice. Validate with registered patent attorneys."
    )
    session_id: Optional[str] = None
    statutory_alert: Optional[dict] = Field(
        default=None, description="Active statutory alert if Section 3(p) or novelty conflict is detected"
    )


# ─── Classification ───────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    """Formulation classification request."""
    formulation_name: str = Field(..., description="Name of the formulation")
    description: str = Field(default="", description="Description of the formulation")
    ingredients: List[str] = Field(default_factory=list, description="List of ingredients")
    is_in_authoritative_text: Optional[bool] = Field(default=None)
    intended_use: str = Field(default="", description="Therapeutic / commercial use")


class ClassifyResponse(BaseModel):
    """Formulation classification response."""
    category: FormulationCategory
    description: str
    ip_protections: List[str] = Field(default_factory=list)
    regulatory_pathway: str = ""
    abs_obligations: str = ""
    tkdl_implications: str = ""


# ─── ABS Compliance ──────────────────────────────────────────────────

class ABSCheckRequest(BaseModel):
    """ABS compliance check request."""
    biological_resource: str = Field(..., description="Name of biological resource")
    source_location: str = Field(default="", description="Where the resource is sourced")
    commercial_use: bool = Field(default=True, description="Is it for commercial use?")
    involves_traditional_knowledge: bool = Field(default=False)


class ABSCheckItem(BaseModel):
    """Single ABS compliance checklist item."""
    requirement: str
    status: str  # "required", "optional", "not_applicable"
    guidance: str


class ABSCheckResponse(BaseModel):
    """ABS compliance check response."""
    compliant: bool
    checklist: List[ABSCheckItem] = Field(default_factory=list)
    guidance: str = ""


# ─── Translation ─────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    """Translation request."""
    text: str = Field(..., min_length=1, max_length=5000)
    source_language: Language = Field(default=Language.ENGLISH)
    target_language: Language = Field(default=Language.HINDI)


class TranslateResponse(BaseModel):
    """Translation response."""
    translated_text: str
    source_language: Language
    target_language: Language


# ─── Feedback ────────────────────────────────────────────────────────

class FeedbackRequest(BaseModel):
    """User feedback on an answer."""
    message_id: str
    rating: str = Field(..., description="helpful / not_helpful / inaccurate")
    comment: Optional[str] = None
