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


# ─── Registration & Compliance Wizard ────────────────────────────────

class WizardStepState(BaseModel):
    """Status of a single wizard step for a user."""
    id: str = Field(..., description="Stable step id (eligibility, classification, udyam, license, gmp, gst, dossier)")
    status: str = Field(default="pending", description="pending | in_progress | completed | not_applicable | milestone")


class WizardStateSaveRequest(BaseModel):
    """Payload to persist a user's wizard progress."""
    current_step: str = Field(default="eligibility")
    product_type: Optional[str] = Field(default=None, description="AYUSH | FSSAI | COSMETIC | UNKNOWN")
    classification: Optional[dict] = Field(default=None, description="Raw /classify response for license routing")
    steps: List[WizardStepState] = Field(default_factory=list)
    answers: Optional[dict] = Field(default=None, description="Free-form per-step form/checklist data")


class WizardStateResponse(BaseModel):
    """A user's persisted wizard progress."""
    user_id: str
    current_step: str = "eligibility"
    product_type: Optional[str] = None
    classification: Optional[dict] = None
    steps: List[WizardStepState] = Field(default_factory=list)
    answers: Optional[dict] = None
    updated_at: Optional[str] = None


# ─── Feedback ────────────────────────────────────────────────────────

class FeedbackRequest(BaseModel):
    """User feedback on an answer."""
    message_id: str
    rating: str = Field(..., description="helpful / not_helpful / inaccurate")
    comment: Optional[str] = None


# ─── Business Enablement: Funding / Loans ────────────────────────────

class FundingMatchRequest(BaseModel):
    """Enterprise profile used to match funding & subsidy schemes."""
    stage: str = Field(default="new", description="idea | new | established")
    loan_amount: float = Field(default=0, ge=0, description="Desired loan in ₹ (0 = derive from project cost)")
    project_cost: float = Field(default=0, ge=0, description="Project / plant & machinery cost in ₹")
    turnover: float = Field(default=0, ge=0, description="Expected annual turnover in ₹")
    sector: str = Field(default="manufacturing", description="manufacturing | service | trading | export")
    location: str = Field(default="urban", description="urban | rural")
    social_category: str = Field(default="general", description="general | obc | sc | st")
    is_woman: bool = Field(default=False, description="Woman / women-led enterprise")
    is_greenfield: bool = Field(default=True, description="New (greenfield) enterprise")
    wants_collateral_free: bool = Field(default=True)
    udyam_registered: bool = Field(default=False)


class SchemeMatch(BaseModel):
    """One evaluated scheme with its eligibility verdict."""
    id: str
    name: str
    aka: str = ""
    ministry: str = ""
    status: str = Field(..., description="eligible | likely | locked | not_eligible")
    band: str = ""
    amount_hint: str = ""
    benefit: str = ""
    docs: List[str] = Field(default_factory=list)
    portal_url: str = ""
    citation: dict = Field(default_factory=dict)
    reasons: List[str] = Field(default_factory=list)


class FundingMatchResponse(BaseModel):
    """Ranked funding-scheme matches for the submitted profile."""
    size_class: str = ""
    locked_udyam: bool = False
    matches: List[SchemeMatch] = Field(default_factory=list)
    disclaimer: str = ""


# ─── Business Enablement: Label Compliance ───────────────────────────

class LabelCheckRequest(BaseModel):
    """Draft label text screened against a statutory labeling ruleset."""
    draft_text: str = Field(..., min_length=1, max_length=20000)
    ruleset: Optional[str] = Field(default=None, description="ayush | fssai (auto-routed if omitted)")
    product_name: str = Field(default="")


class LabelFinding(BaseModel):
    """Presence verdict for a single statutory label element."""
    id: str
    label: str
    status: str = Field(..., description="present | missing | needs_review")
    severity: str = "major"
    matched_text: str = ""
    guidance: str = ""
    citation: dict = Field(default_factory=dict)


class LabelCheckResponse(BaseModel):
    """Label compliance result for one ruleset."""
    ruleset: str
    ruleset_label: str = ""
    authority: str = ""
    total: int = 0
    present: int = 0
    missing: int = 0
    critical_missing: int = 0
    score: int = Field(default=0, ge=0, le=100, description="Weighted presence score (0-100)")
    findings: List[LabelFinding] = Field(default_factory=list)
    citation: dict = Field(default_factory=dict)
    disclaimer: str = ""
