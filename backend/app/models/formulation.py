"""
Pydantic models and schemas for the Formulation Lab.
Covers stoichiometric simulation, Rasa Card tier progression,
Chou-Talalay synergism metrics, NBA ABS calculations, and Pre-FER examination.
"""

from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class RasaTier(str, Enum):
    TIER_1_BALA = "bala"
    TIER_2_KUMARA = "kumara"
    TIER_3_YUVAN = "yuvan"
    TIER_4_VRIDDHA = "vriddha"
    TIER_5_SIDDHA = "siddha"
    TIER_6_DIVYA_RASAYANA = "divya_rasayana"


class BotanicalCategory(str, Enum):
    ADAPTOGEN = "adaptogen"
    BIO_ENHANCER = "bio_enhancer"
    ANTI_INFLAMMATORY = "anti_inflammatory"
    MEDHYA = "medhya"
    CARRIER = "carrier"
    MINERAL_RESIN = "mineral_resin"
    DIGESTIVE = "digestive"


class BotanicalItem(BaseModel):
    id: str = Field(..., description="Unique slug ID, e.g. 'ashwagandha'")
    common_name: str
    sanskrit_name: str
    botanical_name: str
    family: str
    part_used: str
    marker_compound: str
    standardized_percentage: str
    category: BotanicalCategory
    single_agent_ed50: float = Field(default=50.0, description="Baseline ED50 potency for Chou-Talalay model")
    is_mineral_resin: bool = False
    is_threatened: bool = False
    is_cultivated: bool = True
    classical_reference: str = ""
    description: str = ""


class IngredientRatioInput(BaseModel):
    herb_id: str
    ratio: float = Field(..., ge=0.0, le=100.0, description="Percentage w/w")
    is_locked: bool = False


class FormulationSimulateRequest(BaseModel):
    title: str = "Custom Formulation"
    ingredients: List[IngredientRatioInput]
    entity_type: str = Field(default="domestic", description="'domestic' or 'foreign'")
    baseline_id: Optional[str] = None


class PairwiseSynergy(BaseModel):
    herb_a: str
    herb_b: str
    ci_score: float
    status: str
    mechanism: str


class SimulationResponse(BaseModel):
    title: str
    total_ratio: float
    is_balanced: bool
    chou_talalay_ci: float
    ci_interpretation: str
    sec_3e_status: str  # "CLEARED", "BORDERLINE", "REJECTED"
    bioavailability_multiplier: float
    anti_inflammatory_suppression: float
    ojas_power_score: int
    medicine_quality_score: int = 75
    patentability_scope_score: int = 70
    quality_delta: float = 0.0
    patentability_delta: float = 0.0
    quality_trend: str = "STABLE"
    patentability_trend: str = "STABLE"
    quadrant: str = "GOLDEN_SYNERGY"
    quadrant_label: str = "Golden Quadrant (Novel Synergistic Formulation)"
    quadrant_description: str = ""
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    how_to_improve: List[Dict[str, Any]] = Field(default_factory=list)
    what_to_remove: List[Dict[str, Any]] = Field(default_factory=list)
    patient_safety_warnings: List[Dict[str, Any]] = Field(default_factory=list)
    overall_safety_rating: str = "EXCELLENT"
    tier: RasaTier
    tier_sanskrit: str
    tier_english: str
    star_rating: int
    tkdl_concordance_score: int
    tkdl_shloka_match: str
    nba_abs_royalty_percentage: float
    nba_form_tier: str
    tridosha_balance: Dict[str, int]
    active_buffs: List[str]
    active_debuffs: List[str]
    pairwise_synergy: List[PairwiseSynergy]
    hplc_markers: List[Dict[str, Any]]
    cost_waterfall: List[Dict[str, Any]]
    suggestions: List[str]


class PreFERRequest(BaseModel):
    formulation_title: str
    ingredients: List[IngredientRatioInput]
    intended_use: str = "Anti-inflammatory, Rejuvenative, Adaptogenic therapy"


class PreFERObjection(BaseModel):
    section: str
    statute: str
    severity: str  # "FATAL", "OVERCOME", "ADVISORY"
    finding: str
    remedy: str


class PreFERResponse(BaseModel):
    application_no: str
    filing_date: str
    examiner_group: str
    overall_patentability_score: int
    summary: str
    sec_3e_synergy_verified: bool
    sec_3p_tkdl_conflict: bool
    objections: List[PreFERObjection]
    wipo_gratk_status: Dict[str, str]
    recommended_claim_draft: List[str]


class OptimizationRequest(BaseModel):
    ingredients: List[IngredientRatioInput]
    target_tier: Optional[RasaTier] = RasaTier.TIER_6_DIVYA_RASAYANA
