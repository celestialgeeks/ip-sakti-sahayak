"""
API endpoints for the Formulation Lab feature.
Supports live ratio simulations, preset/botanical catalogs (frontend authority),
per-ingredient attribution, Pre-FER patentability reports, scenario autosave,
and AI optimization recommendations.
"""

import json
from pathlib import Path
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException

from app.models.formulation import (
    BotanicalItem,
    FormulationSimulateRequest,
    SimulationResponse,
    PreFERRequest,
    PreFERResponse,
    OptimizationRequest,
    ScenarioSaveRequest,
    ScenarioSummary,
)
from app.core.formulation.engine import (
    simulate_formulation,
    generate_pre_fer,
    load_botanicals,
    load_presets,
)
from app.services.sqlite_service import sqlite_service

router = APIRouter(prefix="/formulation-lab", tags=["Formulation Lab"])

SYNONYMS_FILE = (
    Path(__file__).resolve().parent.parent.parent.parent / "data" / "formulation" / "herb_synonyms.json"
)



@router.get("/herbs", response_model=List[BotanicalItem])
async def get_botanicals():
    """Returns the catalog of standardized Ayurvedic botanicals and active markers."""
    botanicals = load_botanicals()
    return list(botanicals.values())


@router.get("/presets", response_model=List[Dict[str, Any]])
async def get_presets():
    """Returns classical and proprietary formulation templates with computed chips."""
    return load_presets()


@router.get("/synonyms")
async def get_synonyms():
    """Ayurveda-plant-id -> lab-herb-id reconciliation map (spec §8.4.2)."""
    if not SYNONYMS_FILE.exists():
        return {"synonyms": {}}
    with open(SYNONYMS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: FormulationSimulateRequest):
    """
    Simulates a botanical formulation ratio:
    Calculates Chou-Talalay Combination Index, NBA ABS royalty,
    TKDL concordance, Tridosha balance, per-ingredient contributions,
    and Rasa Tier progression. This response is the authoritative score —
    the client's instant re-score is provisional until this returns.
    """
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Formulation must contain at least one ingredient.")
    return simulate_formulation(req)


@router.post("/pre-fer", response_model=PreFERResponse)
async def pre_fer_examination(req: PreFERRequest):
    """
    Generates a simulated Indian Patent Office (IPO) First Examination Report (FER)
    evaluating Section 3(e) synergism, Section 3(p) TKDL conflict, and BDA Rule 13
    compliance. Deterministic; carries no invented application number (§14.1).
    """
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Ingredients required for patent examination.")
    return generate_pre_fer(req)


# ── Scenario persistence ("nothing gets lost", §14.7) ────────────────────────
@router.post("/scenarios")
async def save_scenario(req: ScenarioSaveRequest):
    """Autosave a working formulation. Idempotent upsert by client scenario id."""
    await sqlite_service.save_scenario(
        req.id, req.title, [i.model_dump() for i in req.ingredients], req.entity_type
    )
    return {"saved": req.id}


@router.get("/scenarios", response_model=List[ScenarioSummary])
async def list_scenarios():
    """Recent scenarios for 'Continue recent work'."""
    rows = await sqlite_service.list_scenarios()
    return [ScenarioSummary(**row) for row in rows]


@router.get("/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    data = await sqlite_service.get_scenario(scenario_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Scenario not found.")
    return data


@router.delete("/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: str):
    deleted = await sqlite_service.delete_scenario(scenario_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Scenario not found.")
    return {"deleted": scenario_id}


@router.post("/optimize")
async def optimize_ratios(req: OptimizationRequest):
    """
    Suggests stoichiometric ratio adjustments driven by the engine's own
    structured directives and per-ingredient contributions — not hard-coded ifs.
    """
    sim = simulate_formulation(
        FormulationSimulateRequest(title="Optimization Assessment", ingredients=req.ingredients)
    )

    recommendations: List[Dict[str, Any]] = []
    for d in sim.how_to_improve:
        recommendations.append({
            "action": d["action_type"].upper(),
            "herb_id": d["herb_id"],
            "recommended_ratio": d["target_ratio"],
            "rationale": d["text"],
            "projected_impact": d.get("projected_impact", ""),
        })
    for d in sim.what_to_remove:
        recommendations.append({
            "action": d["action_type"].upper(),
            "herb_id": d["herb_id"],
            "recommended_ratio": d["target_ratio"],
            "rationale": d["text"],
            "projected_impact": d.get("projected_impact", ""),
        })
    for c in sim.contributions:
        if c.state == "blocking" and c.fix is not None:
            recommendations.append({
                "action": c.fix.action_type.upper(),
                "herb_id": c.fix.herb_id,
                "recommended_ratio": c.fix.target_ratio,
                "rationale": c.fix.text,
                "projected_impact": c.fix.projected_impact,
            })

    return {
        "current_tier": sim.tier,
        "current_power": sim.ojas_power_score,
        "recommendations": recommendations,
        "toast_message": sim.suggestions[0] if sim.suggestions else "Formulation is already near equilibrium.",
    }
