"""
API endpoints for the Formulation Lab feature.
Supports live ratio simulations, preset catalog, botanical herbarium,
Pre-FER patentability reports, and AI optimization recommendations.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from app.models.formulation import (
    BotanicalItem,
    FormulationSimulateRequest,
    SimulationResponse,
    PreFERRequest,
    PreFERResponse,
    OptimizationRequest,
)
from app.core.formulation.engine import (
    simulate_formulation,
    generate_pre_fer,
    load_botanicals,
    load_presets,
)

router = APIRouter(prefix="/formulation-lab", tags=["Formulation Lab"])


@router.get("/herbs", response_model=List[BotanicalItem])
async def get_botanicals():
    """Returns the catalog of standardized Ayurvedic botanicals and active markers."""
    botanicals = load_botanicals()
    return list(botanicals.values())


@router.get("/presets", response_model=List[Dict[str, Any]])
async def get_presets():
    """Returns classical and proprietary formulation templates."""
    return load_presets()


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: FormulationSimulateRequest):
    """
    Simulates a botanical formulation ratio:
    Calculates Chou-Talalay Combination Index, NBA ABS royalty,
    TKDL concordance, Tridosha balance, and Rasa Tier progression.
    """
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Formulation must contain at least one ingredient.")
    return simulate_formulation(req)


@router.post("/pre-fer", response_model=PreFERResponse)
async def pre_fer_examination(req: PreFERRequest):
    """
    Generates a simulated Indian Patent Office (IPO) First Examination Report (FER)
    evaluating Section 3(e) synergism, Section 3(p) TKDL conflict, and BDA Rule 13 compliance.
    """
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Ingredients required for patent examination.")
    return generate_pre_fer(req)


@router.post("/optimize")
async def optimize_ratios(req: OptimizationRequest):
    """
    Suggests stoichiometric ratio adjustments and synergistic bio-enhancers
    to elevate a formulation to high-power tiers (Siddha / Divya Rasayana).
    """
    sim = simulate_formulation(
        FormulationSimulateRequest(title="Optimization Assessment", ingredients=req.ingredients)
    )
    
    advice = []
    if sim.chou_talalay_ci > 0.85:
        advice.append({
            "action": "ADD_BIO_ENHANCER",
            "herb_id": "pippali",
            "recommended_ratio": 5.0,
            "rationale": "Incorporating 5.0% Pippali (Piperine) introduces glucuronidation inhibition, dropping CI score below 0.70 to clear Section 3(e)."
        })
    if sim.bioavailability_multiplier < 2.0:
        advice.append({
            "action": "ADD_CARRIER",
            "herb_id": "ghee",
            "recommended_ratio": 15.0,
            "rationale": "Adding Vedic Cow Ghrita liposomal carrier enhances mucosal transport and elevates bioavailability by +1.5x."
        })
    return {
        "current_tier": sim.tier,
        "current_power": sim.ojas_power_score,
        "recommendations": advice,
        "toast_message": sim.suggestions[0] if sim.suggestions else "Formulation is already near alchemical equilibrium."
    }
