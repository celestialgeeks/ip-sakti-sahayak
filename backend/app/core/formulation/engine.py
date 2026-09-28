"""
Formulation Simulation Engine for IP-SAKTI Sahayak.
Implements the Chou-Talalay combination index model, Biological Diversity Act ABS rules,
Classical TKDL concordance checks, and the living Rasa Tier alchemical progression.

Engine contract (formulation-lab-flow-spec.md §5.3 / §8.1):
- All arithmetic uses deterministic half-up rounding helpers (_r0/_r1/_r2) that behave
  identically in this file and in frontend/src/lib/formulation/engine.ts. A pytest
  parity guard (tests/test_engine_parity.py) asserts both engines agree on fixed vectors.
- `score_core` is pure: same ratios + entity_type -> same numbers. Contributions are
  computed by central-difference perturbation (±1.0% w/w) of this core.
- No legal identifiers are ever invented here (§14.1): Pre-FER reports carry
  application_no=None unless an actual examiner service supplies one.
"""

import json
import math
from pathlib import Path
from typing import Dict, List, Any, Optional

from app.models.formulation import (
    BotanicalItem,
    FormulationSimulateRequest,
    SimulationResponse,
    RasaTier,
    PairwiseSynergy,
    PreFERRequest,
    PreFERResponse,
    PreFERObjection,
    IngredientContribution,
    Directive,
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "formulation"
BOTANICALS_FILE = DATA_DIR / "botanicals.json"
PRESETS_FILE = DATA_DIR / "presets.json"

_BOTANICALS_CACHE: Dict[str, BotanicalItem] = {}
_PRESETS_CACHE: List[Dict[str, Any]] = []


def load_botanicals() -> Dict[str, BotanicalItem]:
    global _BOTANICALS_CACHE
    if not _BOTANICALS_CACHE and BOTANICALS_FILE.exists():
        with open(BOTANICALS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                _BOTANICALS_CACHE[item["id"]] = BotanicalItem(**item)
    return _BOTANICALS_CACHE


def load_presets() -> List[Dict[str, Any]]:
    global _PRESETS_CACHE
    if not _PRESETS_CACHE and PRESETS_FILE.exists():
        with open(PRESETS_FILE, "r", encoding="utf-8") as f:
            _PRESETS_CACHE = json.load(f)
    return _PRESETS_CACHE


# ── Deterministic rounding helpers (mirror engine.ts exactly) ────────────────
def _r2(x: float) -> float:
    return math.floor(x * 100 + 0.5) / 100


def _r1(x: float) -> float:
    return math.floor(x * 10 + 0.5) / 10


def _r0(x: float) -> int:
    return int(math.floor(x + 0.5))


# ── Layer taxonomy (§8.2): deterministic mapping from category/flags ─────────
SAH_CARAKA_EXPLICIT = {"guduchi", "amla"}


def layer_for(herb: Optional[BotanicalItem]) -> str:
    if herb is None:
        return "supportive"
    if herb.is_mineral_resin:
        return "resin_bhasma"
    if herb.category == "bio_enhancer":
        return "yogavahi"
    if herb.category == "carrier":
        return "anupana"
    if herb.id in SAH_CARAKA_EXPLICIT or herb.category == "digestive":
        return "sah_caraka"
    if herb.category in ("adaptogen", "anti_inflammatory", "medhya"):
        return "arthin"
    return "supportive"


# Safety warnings kept as explicit clinical rules for these legacy herbs;
# every other herb with a safety_ceiling_percent falls through to the
# generic ceiling check below.
_LEGACY_SAFETY_IDS = {"pippali", "ashwagandha", "shilajit", "haridra", "guggulu", "guduchi", "brahmi"}

# Safe targets for the "reduce to" directives (must match engine.ts)
_LEGACY_SAFE_TARGET = {
    "pippali": 5.0,
    "ashwagandha": 32.0,
    "shilajit": 12.0,
    "haridra": 30.0,
    "guggulu": 20.0,
    "guduchi": 20.0,
    "brahmi": 25.0,
}


def score_core(
    ratios: Dict[str, float],
    entity_type: str,
    botanicals: Dict[str, BotanicalItem],
) -> Dict[str, Any]:
    """Pure scoring core. Deterministic: no I/O, no randomness, no prose beyond
    the fixed strings that engine.ts mirrors verbatim."""
    ashwa = ratios.get("ashwagandha", 0.0)
    shilajit = ratios.get("shilajit", 0.0)
    haridra = ratios.get("haridra", 0.0)
    pippali = ratios.get("pippali", 0.0)
    ghee = ratios.get("ghee", 0.0)
    guduchi = ratios.get("guduchi", 0.0)
    brahmi = ratios.get("brahmi", 0.0)
    guggulu = ratios.get("guggulu", 0.0)
    shallaki = ratios.get("shallaki", 0.0)
    neem = ratios.get("neem", 0.0)
    tulsi = ratios.get("tulsi", 0.0)

    total_ratio = _r2(sum(ratios.values()))
    is_balanced = abs(total_ratio - 100.0) < 0.1

    # 1. Chou-Talalay Combination Index (CI)
    base_ci = 1.15
    if pippali > 0.5:
        base_ci -= min(pippali / 5.0, 1.2) * 0.32
    if ghee >= 8.0:
        base_ci -= 0.12
    if ashwa >= 20.0 and haridra >= 20.0:
        base_ci -= 0.14
    if guduchi >= 5.0:
        base_ci -= 0.08
    if shilajit > 25.0:
        mineral_penalty = ((shilajit - 25.0) / 10.0) * 0.15
        if guduchi >= 10.0:
            mineral_penalty *= 0.3
        base_ci += mineral_penalty
    if ashwa < 15.0 and haridra < 15.0 and brahmi < 15.0:
        base_ci += 0.18
    if pippali < 1.0 and (ashwa + haridra) > 40.0:
        base_ci += 0.12

    ci_score = _r2(max(0.42, min(1.35, base_ci)))

    if ci_score < 0.75:
        sec_3e_status = "CLEARED"
        ci_interpretation = "Super-Additive Synergism (Overcomes Sec 3(e))"
    elif ci_score <= 0.95:
        sec_3e_status = "CLEARED"
        ci_interpretation = "Statistically Significant Synergism"
    elif ci_score <= 1.05:
        sec_3e_status = "BORDERLINE"
        ci_interpretation = "Nearly Additive — Sec 3(e) Objection Likely"
    else:
        sec_3e_status = "REJECTED"
        ci_interpretation = "Sub-Additive / Mere Admixture (Sec 3(e) Bar)"

    # 2. Bioavailability multiplier (Yogavahi effect)
    bio_multiplier = 1.0
    if pippali >= 1.0:
        bio_multiplier += min(pippali * 0.45, 2.2)
    if ghee >= 5.0:
        bio_multiplier += min(ghee * 0.04, 0.6)
    bio_multiplier = _r1(bio_multiplier)

    # 3. Anti-inflammatory NF-κB suppression (%) — extended for catalog expansion
    anti_inflam = (
        haridra * 0.48
        + guggulu * 0.42
        + ashwa * 0.22
        + shallaki * 0.40
        + neem * 0.30
        + tulsi * 0.25
    )
    if pippali >= 3.0:
        anti_inflam *= 1.35
    anti_inflam = _r1(min(anti_inflam, 48.5))

    # 4. Biological Diversity Act (NBA) Benefit-Sharing & ABS Royalty
    abs_royalty = 3.5
    nba_tier = "Fast-Track Category B (Form III)"
    if entity_type == "foreign":
        abs_royalty = 5.0
        nba_tier = "Form I (Prior Approval for Foreign Participation)"
    elif shilajit >= 25.0 or guggulu >= 25.0:
        abs_royalty = 5.0
        nba_tier = "High-Scrutiny Public Hearing (High Mineral/Threatened Burden)"
    elif shilajit <= 10.0 and guggulu <= 10.0:
        abs_royalty = 3.0
        nba_tier = "Fast-Track Form III (Low Mineral Liability)"

    # 5. Classical TKDL Concordance — Guduchi dilutes concordance (§4.1 remedy path)
    tkdl_score = 75
    shloka_match = "Charaka Samhita Chikitsasthanam 28 (Vatavyadhi Chikitsa)"
    if ashwa >= 25.0 and shilajit >= 5.0 and ghee >= 10.0:
        tkdl_score = 92 - int(min(math.floor(guduchi * 0.6), 10))
        shloka_match = "Charaka Samhita Chikitsa 1.1 / Rasatarangini Taranga 22"
    elif ashwa > 45.0:
        tkdl_score = 68
        shloka_match = "Diverges from classical Rasayana ratio; excess single adaptogen"
    elif pippali == 0.0:
        tkdl_score = 58
        shloka_match = "Lacks classical Deepana-Pachana / Yogavāhī vehicle"

    # 6. Tridosha Balancing
    vata, pitta, kapha = 35, 30, 35
    if ashwa >= 30.0:
        vata -= 10
        kapha += 10
    if haridra >= 30.0 or pippali >= 5.0:
        pitta += 15
        kapha -= 10
    if ghee >= 15.0:
        pitta -= 10
        vata -= 5
    tridosha = {"vata": max(10, vata), "pitta": max(10, pitta), "kapha": max(10, kapha)}

    # 7. Buffs & Debuffs
    active_buffs: List[str] = []
    active_debuffs: List[str] = []

    if pippali >= 3.0:
        active_buffs.append("⚡ Yogavāhī Bio-Ignition Active")
    else:
        active_debuffs.append("⚠️ Lacks Yogavāhī Bio-Catalyst")

    if ghee >= 10.0:
        active_buffs.append("🌿 Lipid Carrier Samskara Cleared")
    else:
        active_debuffs.append("⚠️ Missing Liposomal Anupana Carrier")

    if shilajit <= 10.0:
        active_buffs.append("⚖️ Exempt from Artisanal Mineral Penalty")
    elif shilajit > 25.0:
        active_debuffs.append("🛑 High Mineral Surcharge Tier C (+1.5% Royalty)")

    if guduchi >= 5.0:
        active_buffs.append("🛡️ Rasayana Prameha Toxicity Shield")

    if ci_score < 0.75:
        active_buffs.append("🔥 Section 3(e) Synergism Verified")
    elif ci_score > 1.0:
        active_debuffs.append("🛑 Mere Admixture Objection Imminent (IPO §3(e))")

    # Layer coverage diagnosis (§8.2): a well-formed yoga spans all five layers.
    layers_present = set()
    for hid, r in ratios.items():
        if r <= 0:
            continue
        lyr = layer_for(botanicals.get(hid))
        if lyr != "supportive":
            layers_present.add(lyr)
    layer_bonus = (len(layers_present) - 3) * 2.0

    # 8. Ojas Power Score
    synergy_component = max(0.0, (1.25 - ci_score) / (1.25 - 0.45)) * 4500
    bio_component = (bio_multiplier / 3.5) * 2200
    tkdl_component = (tkdl_score / 100.0) * 1800
    suppression_component = (anti_inflam / 48.5) * 1500
    buff_bonus = (len(active_buffs) * 250) - (len(active_debuffs) * 400)
    raw_power = synergy_component + bio_component + tkdl_component + suppression_component + buff_bonus
    ojas_power = max(1100, min(9999, _r0(raw_power)))

    # 9. Rasa Tier Assignment
    if ojas_power >= 9200:
        tier_id = "divya_rasayana"
        tier_sanskrit = "दिव्य रसायन • DIVYA RASAYANA"
        tier_english = "Transcendent Sovereign Rejuvenator"
        star_rating = 5
    elif ojas_power >= 8000:
        tier_id = "siddha"
        tier_sanskrit = "सिद्ध • SIDDHA"
        tier_english = "Perfected Masterwork"
        star_rating = 5
    elif ojas_power >= 6500:
        tier_id = "vriddha"
        tier_sanskrit = "वृद्ध • VRIDDHA"
        tier_english = "Mature Alchemical Equilibrium"
        star_rating = 4
    elif ojas_power >= 5000:
        tier_id = "yuvan"
        tier_sanskrit = "युवन् • YUVAN"
        tier_english = "Active Potency Combination"
        star_rating = 3
    elif ojas_power >= 3500:
        tier_id = "kumara"
        tier_sanskrit = "कुमार • KUMĀRA"
        tier_english = "Nascent Combination"
        star_rating = 2
    else:
        tier_id = "bala"
        tier_sanskrit = "बाल • BĀLA"
        tier_english = "Infant / Raw Admixture"
        star_rating = 1

    # 13. Patient Clinical Safety & Toxicity Hazard Evaluation
    patient_safety_warnings: List[Dict[str, Any]] = []

    if pippali > 8.0:
        patient_safety_warnings.append({
            "herb_id": "pippali",
            "herb_name": "Pippali (Piper longum)",
            "current_dose_percent": pippali,
            "severity": "CRITICAL",
            "hazard": "Gastric Mucosal Hyperacidity & CYP3A4 Hepatic Inhibition",
            "clinical_manifestation": "Severe epigastric burning, reflux, and dangerous elevation of co-administered prescription drug serum levels (statins, warfarin, calcium channel blockers).",
            "affected_populations": ["Patients with GERD or active peptic ulcers", "Patients on prescription anticoagulants/cardiac drugs"],
            "safe_limit": "API Standard: Max 3.0% - 6.0% w/w (<= 500mg/day)",
        })
    elif pippali > 6.0:
        patient_safety_warnings.append({
            "herb_id": "pippali",
            "herb_name": "Pippali (Piper longum)",
            "current_dose_percent": pippali,
            "severity": "WARNING",
            "hazard": "Elevated Thermogenic Agni & Minor GI Irritation",
            "clinical_manifestation": "Mild heartburn and increased Pitta dosha in susceptible individuals.",
            "affected_populations": ["Individuals with Paittika constitution"],
            "safe_limit": "Recommended: <= 5.0% w/w",
        })

    if ashwa > 45.0:
        patient_safety_warnings.append({
            "herb_id": "ashwagandha",
            "herb_name": "Ashwagandha (Withania somnifera)",
            "current_dose_percent": ashwa,
            "severity": "WARNING",
            "hazard": "Excessive CNS Sedation & Thyroid Over-Stimulation",
            "clinical_manifestation": "Daytime lethargy, marked somnolence, elevated free T3/T4 thyroid hormone levels, and gastrointestinal cramps.",
            "affected_populations": ["Patients with Hyperthyroidism", "Operators of heavy machinery", "Pregnant individuals (uterine spasm risk)"],
            "safe_limit": "API Part-I: Max 30.0% - 40.0% w/w in multi-herb compounded extracts",
        })

    if shilajit > 20.0:
        patient_safety_warnings.append({
            "herb_id": "shilajit",
            "herb_name": "Shilajit (Asphaltum punjabianum)",
            "current_dose_percent": shilajit,
            "severity": "CRITICAL",
            "hazard": "Fulvic-Mineral Surcharge & Hyperuricemia Exacerbation",
            "clinical_manifestation": "Elevated serum uric acid triggering acute gout attacks; renal microvascular strain from excessive mineral resin burden.",
            "affected_populations": ["Patients with active gout / hyperuricemia", "Renal insufficiency patients", "Patients with hypotensive tendency"],
            "safe_limit": "Ayurvedic Pharmacopoeia: Max 10.0% - 15.0% w/w (100 - 250mg per unit dose)",
        })

    if haridra > 35.0:
        patient_safety_warnings.append({
            "herb_id": "haridra",
            "herb_name": "Haridra (Curcuma longa)",
            "current_dose_percent": haridra,
            "severity": "WARNING",
            "hazard": "Biliary Hyper-Contraction & Antiplatelet Aggregation",
            "clinical_manifestation": "Severe biliary colic in patients with undiagnosed gallstones; increased bleeding tendency in perioperative settings.",
            "affected_populations": ["Patients with Cholelithiasis (gallstones)", "Patients scheduled for elective surgery (discontinue 14 days prior)"],
            "safe_limit": "Max 25.0% - 30.0% w/w in concentrated extracts",
        })

    if guggulu > 25.0:
        patient_safety_warnings.append({
            "herb_id": "guggulu",
            "herb_name": "Guggulu (Commiphora mukul)",
            "current_dose_percent": guggulu,
            "severity": "WARNING",
            "hazard": "Cutaneous Allergic Dermatitis & Uterine Tone Stimulation",
            "clinical_manifestation": "Maculopapular allergic skin eruptions, diarrhea, and mild uterine cramping.",
            "affected_populations": ["Pregnant or lactating women", "Individuals with hypersensitive dermatological history"],
            "safe_limit": "Max 15.0% - 20.0% w/w",
        })

    if guduchi > 25.0:
        patient_safety_warnings.append({
            "herb_id": "guduchi",
            "herb_name": "Guduchi (Tinospora cordifolia)",
            "current_dose_percent": guduchi,
            "severity": "INFO",
            "hazard": "Enhanced Hypoglycemic Potentiation",
            "clinical_manifestation": "Risk of excessive blood glucose drops when administered alongside oral anti-diabetic agents or insulin.",
            "affected_populations": ["Diabetic patients on pharmacological hypoglycemia therapies"],
            "safe_limit": "Max 15.0% - 20.0% w/w",
        })

    if brahmi > 30.0:
        patient_safety_warnings.append({
            "herb_id": "brahmi",
            "herb_name": "Brahmi (Bacopa monnieri)",
            "current_dose_percent": brahmi,
            "severity": "WARNING",
            "hazard": "Vagal Autonomic Activation & Bradycardia",
            "clinical_manifestation": "Slowed resting heart rate, increased gastrointestinal secretions, occasional nausea on empty stomach.",
            "affected_populations": ["Patients with baseline sinus bradycardia or conduction delays"],
            "safe_limit": "Max 20.0% - 25.0% w/w",
        })

    # Generic ceiling rule for every catalogued herb beyond the legacy set.
    for hid, r in sorted(ratios.items()):
        if hid in _LEGACY_SAFETY_IDS or r <= 0:
            continue
        herb = botanicals.get(hid)
        if herb is None or herb.safety_ceiling_percent is None:
            continue
        ceiling = herb.safety_ceiling_percent
        if r > ceiling:
            severity = "CRITICAL" if r > ceiling * 1.5 else "WARNING"
            patient_safety_warnings.append({
                "herb_id": hid,
                "herb_name": f"{herb.common_name} ({herb.botanical_name})",
                "current_dose_percent": r,
                "severity": severity,
                "hazard": f"Exceeds {herb.classical_reference.split(' / ')[0] if herb.classical_reference else 'API'} safety ceiling of {ceiling}% w/w",
                "clinical_manifestation": f"{herb.common_name} above {ceiling}% w/w risks dose-dependent adverse effects documented in the Ayurvedic Pharmacopoeia of India; reduce toward the {ceiling}% ceiling.",
                "affected_populations": ["General population at therapeutic dosing"],
                "safe_limit": f"Max {ceiling}% w/w",
            })

    overall_safety_rating = "EXCELLENT"
    if any(w["severity"] == "CRITICAL" for w in patient_safety_warnings):
        overall_safety_rating = "HIGH_TOXICITY_RISK"
    elif any(w["severity"] == "WARNING" for w in patient_safety_warnings):
        overall_safety_rating = "MODERATE_CAUTION"

    # 14. Medicine Quality & Patentability Correlation Scores
    # (Weights tuned so the preset gallery has a real spread — a copy of this
    # block lives in engine.ts and is guarded by the parity fixture.)
    quality_base = 32.0
    quality_base += min(bio_multiplier * 10.0, 30.0)
    quality_base += min((anti_inflam / 48.5) * 22.0, 22.0)
    if is_balanced:
        quality_base += 8.0
    quality_base += len(active_buffs) * 3.0 - len(active_debuffs) * 5.0
    quality_base += layer_bonus
    if any(w["severity"] == "CRITICAL" for w in patient_safety_warnings):
        quality_base -= 14.0
    elif any(w["severity"] == "WARNING" for w in patient_safety_warnings):
        quality_base -= 6.0
    medicine_quality_score = max(12, min(99, _r0(quality_base)))

    patent_score = 30.0
    if ci_score < 0.75:
        patent_score = 88.0 + (0.75 - ci_score) * 30.0
    elif ci_score <= 0.95:
        patent_score = 72.0 + (0.95 - ci_score) * 40.0
    elif ci_score <= 1.05:
        patent_score = 48.0 + (1.05 - ci_score) * 50.0
    else:
        patent_score = max(15.0, 38.0 - (ci_score - 1.05) * 40.0)
    if ghee >= 8.0:
        patent_score += 6.0
    if 3.0 <= pippali <= 6.0:
        patent_score += 4.0
    patentability_scope_score = max(10, min(98, _r0(patent_score)))

    quadrant = "MERE_ADMIXTURE"
    quadrant_label = "Unpatentable Mere Admixture (§3(e) Bar)"
    quadrant_description = "Linear addition of known botanicals without synergistic non-obviousness. High likelihood of statutory rejection."
    if medicine_quality_score >= 70 and patentability_scope_score >= 68:
        quadrant = "GOLDEN_SYNERGY"
        quadrant_label = "Golden Quadrant (Novel Synergistic Formulation)"
        quadrant_description = "Super-additive pharmacodynamics legally overcome Section 3(e) with proven clinical bioavailability and high grant probability."
    elif medicine_quality_score >= 70 and patentability_scope_score < 68:
        quadrant = "CLASSICAL_TRAP"
        quadrant_label = "Classical Prior Art Trap (§3(p) Bar)"
        quadrant_description = "High therapeutic value, but vulnerable to anticipation under Section 3(p) / Traditional Knowledge Digital Library (TKDL) citations."
    elif medicine_quality_score < 70 and patentability_scope_score >= 68:
        quadrant = "NOVEL_DEFICIENT"
        quadrant_label = "Novel but Clinically Deficient"
        quadrant_description = "Unusual ratio achieves distance from prior art, but lacks balanced botanical co-factors or optimal therapeutic synergy."

    # Production economics (unit cost derived from the same royalty the ABS rules produced)
    cost_per_unit = _r2(42.0 + 18.5 + 9.2 + 140.0 * (abs_royalty / 100.0))

    return {
        "total_ratio": total_ratio,
        "is_balanced": is_balanced,
        "chou_talalay_ci": ci_score,
        "ci_interpretation": ci_interpretation,
        "sec_3e_status": sec_3e_status,
        "bioavailability_multiplier": bio_multiplier,
        "anti_inflammatory_suppression": anti_inflam,
        "nba_abs_royalty_percentage": abs_royalty,
        "nba_form_tier": nba_tier,
        "tkdl_concordance_score": tkdl_score,
        "tkdl_shloka_match": shloka_match,
        "tridosha_balance": tridosha,
        "active_buffs": active_buffs,
        "active_debuffs": active_debuffs,
        "layers_present": sorted(layers_present),
        "ojas_power_score": ojas_power,
        "tier": tier_id,
        "tier_sanskrit": tier_sanskrit,
        "tier_english": tier_english,
        "star_rating": star_rating,
        "patient_safety_warnings": patient_safety_warnings,
        "overall_safety_rating": overall_safety_rating,
        "medicine_quality_score": medicine_quality_score,
        "patentability_scope_score": patentability_scope_score,
        "quadrant": quadrant,
        "quadrant_label": quadrant_label,
        "quadrant_description": quadrant_description,
        "cost_per_unit": cost_per_unit,
    }


# ── Per-ingredient attribution (§8.1) ────────────────────────────────────────
def compute_contributions(
    ratios: Dict[str, float],
    entity_type: str,
    botanicals: Dict[str, BotanicalItem],
    warnings: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Central-difference perturbation: perturb each ingredient by ±1.0% w/w,
    re-score the pure core, take the delta. Deterministic, no randomness."""
    out: List[Dict[str, Any]] = []
    for herb_id in sorted(ratios.keys()):
        r = ratios[herb_id]
        if r <= 0:
            continue
        up = dict(ratios)
        down = dict(ratios)
        up[herb_id] = _r2(r + 1.0)
        down[herb_id] = _r2(max(0.0, r - 1.0))
        s_up = score_core(up, entity_type, botanicals)
        s_down = score_core(down, entity_type, botanicals)

        q_delta = _r1((s_up["medicine_quality_score"] - s_down["medicine_quality_score"]) / 2.0)
        ci_delta = _r2((s_up["chou_talalay_ci"] - s_down["chou_talalay_ci"]) / 2.0)
        pat_delta = _r1((s_up["patentability_scope_score"] - s_down["patentability_scope_score"]) / 2.0)
        roy_delta = _r2((s_up["nba_abs_royalty_percentage"] - s_down["nba_abs_royalty_percentage"]) / 2.0)
        cost_delta = _r2((s_up["cost_per_unit"] - s_down["cost_per_unit"]) / 2.0)

        herb = botanicals.get(herb_id)
        layer = layer_for(herb)
        herb_name = (
            f"{herb.common_name} ({herb.botanical_name})" if herb else herb_id
        )

        warning = next((w for w in warnings if w["herb_id"] == herb_id), None)
        blocking_reason: Optional[str] = None
        state = "positive"
        if warning is not None and warning["severity"] in ("CRITICAL", "WARNING"):
            state = "blocking"
            blocking_reason = "safety_ceiling"

        if state != "blocking" and (
            q_delta <= -0.1 or ci_delta >= 0.01 or pat_delta <= -0.1 or roy_delta >= 0.25
        ):
            state = "negative"

        fix = None
        if state == "blocking" and warning is not None:
            target = _LEGACY_SAFE_TARGET.get(herb_id)
            if target is None and herb is not None and herb.safety_ceiling_percent is not None:
                target = herb.safety_ceiling_percent
            if target is not None and r > target:
                fix = {
                    "action_type": "decrease",
                    "herb_id": herb_id,
                    "target_ratio": target,
                    "text": f"Reduce {herb_name} to {target}% w/w",
                }
        elif state == "negative" and r > 1.0:
            fix = {
                "action_type": "decrease",
                "herb_id": herb_id,
                "target_ratio": _r1(max(0.0, r - 1.0)),
                "text": f"Reduce {herb_name} by 1.0% w/w",
            }

        out.append({
            "herb_id": herb_id,
            "herb_name": herb_name,
            "ratio": r,
            "layer": layer,
            "quality_delta": q_delta,
            "ci_delta": ci_delta,
            "patentability_delta": pat_delta,
            "royalty_delta": roy_delta,
            "cost_delta": cost_delta,
            "state": state,
            "blocking_reason": blocking_reason,
            "fix": fix,
        })
    return out


def _projected_impact(
    ratios: Dict[str, float],
    entity_type: str,
    botanicals: Dict[str, BotanicalItem],
    action_type: str,
    herb_id: str,
    target_ratio: float,
    base: Dict[str, Any],
) -> str:
    """What the headline numbers become if this directive is applied."""
    trial = dict(ratios)
    if action_type == "remove":
        trial.pop(herb_id, None)
    else:
        trial[herb_id] = target_ratio
    s = score_core(trial, entity_type, botanicals)
    dq = s["medicine_quality_score"] - base["medicine_quality_score"]
    return (
        f"Quality {base['medicine_quality_score']}"
        f"{' → ' + str(s['medicine_quality_score']) if dq else ''}"
        f" · CI {s['chou_talalay_ci']}"
        f" · §3(e) {s['sec_3e_status']}"
        f" · TKDL {s['tkdl_concordance_score']}"
    )


def simulate_formulation(req: FormulationSimulateRequest) -> SimulationResponse:
    botanicals = load_botanicals()

    ratios: Dict[str, float] = {}
    for ing in req.ingredients:
        ratios[ing.herb_id] = round(float(ing.ratio), 2)

    core = score_core(ratios, req.entity_type, botanicals)
    total_ratio = core["total_ratio"]
    is_balanced = core["is_balanced"]
    ci_score = core["chou_talalay_ci"]
    sec_3e_status = core["sec_3e_status"]
    ci_interpretation = core["ci_interpretation"]
    bio_multiplier = core["bioavailability_multiplier"]
    anti_inflam = core["anti_inflammatory_suppression"]
    abs_royalty = core["nba_abs_royalty_percentage"]
    nba_tier = core["nba_form_tier"]
    tkdl_score = core["tkdl_concordance_score"]
    shloka_match = core["tkdl_shloka_match"]
    tridosha = core["tridosha_balance"]
    active_buffs = core["active_buffs"]
    active_debuffs = core["active_debuffs"]
    ojas_power = core["ojas_power_score"]
    tier_id = core["tier"]
    tier_sanskrit = core["tier_sanskrit"]
    tier_english = core["tier_english"]
    star_rating = core["star_rating"]
    patient_safety_warnings = core["patient_safety_warnings"]
    overall_safety_rating = core["overall_safety_rating"]
    medicine_quality_score = core["medicine_quality_score"]
    patentability_scope_score = core["patentability_scope_score"]
    quadrant = core["quadrant"]
    quadrant_label = core["quadrant_label"]
    quadrant_description = core["quadrant_description"]
    cost_per_unit = core["cost_per_unit"]

    try:
        tier = RasaTier(tier_id)
    except ValueError:  # pragma: no cover - tier ids are enum-aligned by construction
        tier = RasaTier.TIER_1_BALA

    ashwa = ratios.get("ashwagandha", 0.0)
    shilajit = ratios.get("shilajit", 0.0)
    haridra = ratios.get("haridra", 0.0)
    pippali = ratios.get("pippali", 0.0)
    ghee = ratios.get("ghee", 0.0)
    guduchi = ratios.get("guduchi", 0.0)

    quality_delta = round((medicine_quality_score - 62) * 10) / 10
    patentability_delta = round((patentability_scope_score - 52) * 10) / 10
    quality_trend = "SURGE" if quality_delta > 4 else "DECLINE" if quality_delta < -4 else "STABLE"
    patentability_trend = "SURGE" if patentability_delta > 4 else "DECLINE" if patentability_delta < -4 else "STABLE"

    # 10. Pairwise Synergy Grid
    pairwise: List[PairwiseSynergy] = [
        PairwiseSynergy(
            herb_a="Haridra (Curcuma longa)",
            herb_b="Pippali (Piper longum)",
            ci_score=0.54 if pippali >= 3.0 else 1.05,
            status="Super-Additive" if pippali >= 3.0 else "Inactive",
            mechanism="Piperine downregulates CYP3A4 & P-gp, multiplying curcuminoid bio-absorption by 2000%.",
        ),
        PairwiseSynergy(
            herb_a="Ashwagandha (Withania somnifera)",
            herb_b="Shilajit (Asphaltum punjabianum)",
            ci_score=0.64 if shilajit <= 15.0 else 0.88,
            status="Synergistic" if shilajit <= 15.0 else "Moderate",
            mechanism="Fulvic acid complexes with withanolides, accelerating cellular mitochondrial ATP replenishment.",
        ),
        PairwiseSynergy(
            herb_a="Ashwagandha (Withania somnifera)",
            herb_b="Cow Ghrita (A2 Lipid)",
            ci_score=0.69 if ghee >= 10.0 else 0.98,
            status="Synergistic" if ghee >= 10.0 else "Sub-optimal",
            mechanism="Liposomal encapsulation bypasses gastric acid degradation, enhancing lymphatic uptake.",
        ),
    ]

    # 11. HPLC Marker Assay Profile
    hplc_markers = [
        {
            "marker": "Withanolides (Withaferin-A)",
            "botanical": "Withania somnifera",
            "detected": f"{round(ashwa * 0.13, 2)}% w/w",
            "api_spec": "Min 0.50% w/w (API Part-I Vol-I)",
            "compliance": "PASS" if (ashwa * 0.13) >= 0.50 else "SUB-POTENT",
        },
        {
            "marker": "Total Curcuminoids",
            "botanical": "Curcuma longa",
            "detected": f"{round(haridra * 0.95, 2)}% w/w",
            "api_spec": "Min 90.0% of extract fraction",
            "compliance": "PASS" if haridra >= 10.0 else "DEFICIENT",
        },
        {
            "marker": "Piperine Bio-Catalyst",
            "botanical": "Piper longum",
            "detected": f"{round(pippali * 0.98, 2)}% w/w",
            "api_spec": "3.0% - 8.0% w/w recommended",
            "compliance": "OPTIMAL" if 2.5 <= pippali <= 10.0 else "ALERT",
        },
        {
            "marker": "Fulvic Acid Fraction",
            "botanical": "Asphaltum punjabianum",
            "detected": f"{round(shilajit * 0.50, 2)}% w/w",
            "api_spec": "Max 15.0% resin burden",
            "compliance": "PASS" if shilajit <= 15.0 else "EXCESS_RESIN",
        },
    ]

    # 12. Production Economics Waterfall
    cost_waterfall = [
        {"stage": "Raw Botanical Procurement", "cost_inr": 42.0, "unit": "per 500mg dose"},
        {"stage": "Classical Shodhana & Samskara Processing", "cost_inr": 18.5, "unit": "GMP Schedule T"},
        {"stage": "Standardization & HPLC Quality Control", "cost_inr": 9.2, "unit": "NABL Accredited"},
        {"stage": f"NBA Benefit-Sharing Levy ({abs_royalty}%)", "cost_inr": round(140.0 * (abs_royalty / 100.0), 2), "unit": "Net Ex-Factory"},
        {"stage": "Unit Ex-Factory Realization", "cost_inr": 140.0, "unit": "Retail MRP ₹299"},
        {"stage": "Projected Net Commercial Margin", "cost_inr": round(140.0 - cost_per_unit, 2), "unit": "Healthy 43% EBITDA"},
    ]

    # 15. Pros / Cons (composite prose; kept for the dossier — contribution rows
    # replace these on the bench itself)
    pros: List[str] = []
    cons: List[str] = []

    if ci_score < 0.75:
        pros.append(f"Super-Additive Synergy (CI: {ci_score}): Meets strict experimental threshold of Section 3(e) Indian Patent Act.")
    elif ci_score <= 0.95:
        pros.append(f"Statistically Significant Synergy (CI: {ci_score}): Evidence supports non-obvious biological interaction.")
    else:
        cons.append(f"Section 3(e) Mere Admixture Risk: Chou-Talalay CI ({ci_score}) indicates linear or sub-additive interaction.")

    if bio_multiplier >= 2.0:
        pros.append(f"Bio-Availability Multiplier {bio_multiplier}x: Active constituents achieve elevated serum absorption via Yogavāhī dynamics.")
    elif pippali == 0.0:
        cons.append("Missing Yogavāhī Bio-Catalyst: Lacks Piperine or equivalent driver to maximize intestinal active absorption.")

    if ghee >= 8.0:
        pros.append("Liposomal Lipid Delivery Samskara: Protects acid-labile polyphenols against gastric enzymatic degradation.")
    else:
        cons.append("Lack of Lipid Carrier Vehicle: Unprotected polyphenols face high first-pass hepatic metabolism.")

    if 0 < shilajit <= 15.0:
        pros.append("Safe Mineral Resin Ratio: Fulvic acid enhances cellular ATP without triggering heavy-metal scrutiny.")
    elif shilajit > 20.0:
        cons.append("Excessive Mineral Resin Burden: High Shilajit concentration incurs 5% NBA ABS royalty and elevated uric acid warning.")

    if ashwa > 45.0:
        cons.append("Excess Adaptogenic Load: High Withanolide concentration may induce drowsiness and thyroid hyper-stimulation.")

    if is_balanced:
        pros.append("Stoichiometric Equilibrium: Total constituents equal 100.0% w/w with validated batch uniformity.")
    else:
        cons.append(f"Unbalanced Stoichiometry: Total constituent ratio is {total_ratio}% (target is exactly 100.0%).")

    # 16. Structured directives with projected impact (§8.1)
    how_to_improve: List[Dict[str, Any]] = []
    what_to_remove: List[Dict[str, Any]] = []

    def _add(target_list: List[Dict[str, Any]], action_type: str, herb_id: str, target_ratio: float, text: str) -> None:
        target_list.append({
            "text": text,
            "action_type": action_type,
            "herb_id": herb_id,
            "target_ratio": target_ratio,
            "projected_impact": _projected_impact(
                ratios, req.entity_type, botanicals, action_type, herb_id, target_ratio, core
            ),
        })

    if pippali == 0.0:
        _add(how_to_improve, "add", "pippali", 5.0,
             "Add 5.0% Pippali (Piper longum) to ignite 2.2x Yogavāhī bio-availability and drop CI score into Section 3(e) cleared zone.")
    elif pippali < 3.0:
        _add(how_to_improve, "increase", "pippali", 4.5,
             "Increase Pippali to 4.5% to reach full therapeutic bioavailability threshold for Curcuminoids.")
    elif pippali > 7.0:
        _add(what_to_remove, "decrease", "pippali", 5.0,
             "Reduce Pippali to 5.0% to resolve gastric mucosal irritation and prevent CYP3A4 enzyme inhibition.")

    if ghee < 15.0:
        _add(how_to_improve, "increase" if ghee > 0 else "add", "ghee", 15.0,
             "Increase Cow Ghrita to 15.0% to establish the lipid-carrier (Anupana) layer and lift bioavailability above 2x.")

    if shilajit > 18.0:
        _add(what_to_remove, "decrease", "shilajit", 12.0,
             "Reduce Shilajit to 12.0% to eliminate high uric acid warning and downgrade NBA ABS levy from 5% to 3.5%.")

    if ashwa > 40.0:
        _add(what_to_remove, "decrease", "ashwagandha", 32.0,
             "Reduce Ashwagandha to 32.0% to prevent adaptogenic receptor saturation and eliminate somnolence warnings.")

    if guduchi == 0.0 and shilajit > 10.0:
        _add(how_to_improve, "add", "guduchi", 5.0,
             "Add 5.0% Guduchi (Tinospora cordifolia) to act as a Rasayana shield against mineral oxidation.")

    if tkdl_score >= 90:
        _add(how_to_improve, "add" if guduchi == 0.0 else "increase", "guduchi", _r1(guduchi + 6.0),
             f"Add Guduchi 6.0% → drop TKDL concordance {tkdl_score} below the §3(p) 90 line.")

    # Ceiling breaches for non-legacy herbs get an explicit decrease directive.
    for w in patient_safety_warnings:
        hid = w["herb_id"]
        already = any(d["herb_id"] == hid for d in how_to_improve + what_to_remove)
        if already:
            continue
        target = _LEGACY_SAFE_TARGET.get(hid)
        if target is None:
            herb = botanicals.get(hid)
            if herb is not None and herb.safety_ceiling_percent is not None:
                target = herb.safety_ceiling_percent
        if target is not None and w["current_dose_percent"] > target:
            _add(what_to_remove, "decrease", hid, target,
                 f"Reduce {w['herb_name']} to {target}% w/w — {w['hazard']}.")

    # 17. Suggestions (legacy prose channel; directives above are the machine path)
    suggestions: List[str] = []
    if how_to_improve:
        suggestions.append(how_to_improve[0]["text"])
    if what_to_remove:
        suggestions.append(what_to_remove[0]["text"])
    if not suggestions:
        suggestions.append("Formulation has attained optimal stoichiometric balance and statutory Section 3(e) clearance.")

    # 18. Per-ingredient attribution (§8.1) — the new output object
    contributions_raw = compute_contributions(ratios, req.entity_type, botanicals, patient_safety_warnings)

    # Annotate each fix with its projected impact
    contributions: List[IngredientContribution] = []
    for c in contributions_raw:
        fix = None
        if c["fix"] is not None:
            fix = Directive(
                **c["fix"],
                projected_impact=_projected_impact(
                    ratios, req.entity_type, botanicals,
                    c["fix"]["action_type"], c["fix"]["herb_id"], c["fix"]["target_ratio"], core,
                ),
            )
        contributions.append(IngredientContribution(
            herb_id=c["herb_id"],
            herb_name=c["herb_name"],
            ratio=c["ratio"],
            layer=c["layer"],
            quality_delta=c["quality_delta"],
            ci_delta=c["ci_delta"],
            patentability_delta=c["patentability_delta"],
            royalty_delta=c["royalty_delta"],
            cost_delta=c["cost_delta"],
            state=c["state"],
            blocking_reason=c["blocking_reason"],
            fix=fix,
        ))

    return SimulationResponse(
        title=req.title,
        total_ratio=total_ratio,
        is_balanced=is_balanced,
        chou_talalay_ci=ci_score,
        ci_interpretation=ci_interpretation,
        sec_3e_status=sec_3e_status,
        bioavailability_multiplier=bio_multiplier,
        anti_inflammatory_suppression=anti_inflam,
        ojas_power_score=ojas_power,
        medicine_quality_score=medicine_quality_score,
        patentability_scope_score=patentability_scope_score,
        quality_delta=quality_delta,
        patentability_delta=patentability_delta,
        quality_trend=quality_trend,
        patentability_trend=patentability_trend,
        quadrant=quadrant,
        quadrant_label=quadrant_label,
        quadrant_description=quadrant_description,
        pros=pros,
        cons=cons,
        how_to_improve=how_to_improve,
        what_to_remove=what_to_remove,
        patient_safety_warnings=patient_safety_warnings,
        overall_safety_rating=overall_safety_rating,
        tier=tier,
        tier_sanskrit=tier_sanskrit,
        tier_english=tier_english,
        star_rating=star_rating,
        tkdl_concordance_score=tkdl_score,
        tkdl_shloka_match=shloka_match,
        nba_abs_royalty_percentage=abs_royalty,
        nba_form_tier=nba_tier,
        tridosha_balance=tridosha,
        active_buffs=active_buffs,
        active_debuffs=active_debuffs,
        pairwise_synergy=pairwise,
        hplc_markers=hplc_markers,
        cost_waterfall=cost_waterfall,
        suggestions=suggestions,
        entity_type=req.entity_type,
        cost_per_unit=cost_per_unit,
        contributions=contributions,
    )


def generate_pre_fer(req: PreFERRequest) -> PreFERResponse:
    """
    Generates a deterministic simulated IPO First Examination Report.

    Honesty rule (§14.1): this is a pre-filing rehearsal, not a filing. It carries
    NO application number and NO filing date — inventing those would fabricate a
    legal artifact. Verdicts stay deterministic; the LLM never moves them.
    """
    sim_res = simulate_formulation(
        FormulationSimulateRequest(title=req.formulation_title, ingredients=req.ingredients)
    )

    objections: List[PreFERObjection] = []

    if sim_res.sec_3e_status == "REJECTED":
        objections.append(PreFERObjection(
            section="Section 3(e)",
            statute="The Patents Act, 1970 (as amended)",
            severity="FATAL",
            finding=(
                f"The claimed composition exhibits a Chou-Talalay Combination Index of {sim_res.chou_talalay_ci} (> 1.05). "
                "In the absence of quantifiable synergistic biological efficacy beyond the mathematical sum of individual botanical constituents, "
                "the composition is rejected as a mere admixture resulting only in aggregation of properties."
            ),
            remedy="Incorporate a standardized bio-enhancer (e.g. Piperine >= 3% w/w) or Samskara liposomal carrier and submit in-vitro IC50 delta assay data to substantiate synergistic enhancement.",
        ))
    elif sim_res.sec_3e_status == "BORDERLINE":
        objections.append(PreFERObjection(
            section="Section 3(e)",
            statute="The Patents Act, 1970 (as amended)",
            severity="ADVISORY",
            finding=f"Combination Index is borderline ({sim_res.chou_talalay_ci}). Examiner requests comparative in-vitro data against single-agent baselines.",
            remedy="Provide statistical p-value verification (< 0.05) showing non-obvious bio-enhancement.",
        ))
    else:
        objections.append(PreFERObjection(
            section="Section 3(e)",
            statute="The Patents Act, 1970 (as amended)",
            severity="OVERCOME",
            finding=(
                f"Combination Index verified at {sim_res.chou_talalay_ci} (< 0.85). Non-obvious synergistic enhancement established. "
                "Mere admixture rejection under Section 3(e) is satisfactorily overcome."
            ),
            remedy="Maintain validated stoichiometric ratios within Claim 1 dependent claims.",
        ))

    # Section 3(p) TKDL objection — statutory bar, FATAL while concordance ≥ 90
    if sim_res.tkdl_concordance_score >= 90:
        objections.append(PreFERObjection(
            section="Section 3(p)",
            statute="The Patents Act, 1970 (as amended)",
            severity="FATAL",
            finding=(
                f"At TKDL concordance {sim_res.tkdl_concordance_score} the composition reads as traditional knowledge per se "
                f"({sim_res.tkdl_shloka_match}); anticipation under Section 3(p) bars the grant."
            ),
            remedy="Dilute the classical signature: add Guduchi 6.0% w/w to drop concordance below the 90 line, or amend claims to the novel standardized extraction ratio and synergistic mechanism rather than the broad traditional recipe.",
        ))

    # Patient-safety CRITICAL findings are examiner-visible in the dossier
    for w in sim_res.patient_safety_warnings:
        if w["severity"] == "CRITICAL":
            objections.append(PreFERObjection(
                section="Section 4(3)(v) / Drug & Cosmetics Rule 148",
                statute="Patient safety disclosure",
                severity="ADVISORY",
                finding=f"{w['herb_name']} at {w['current_dose_percent']}% w/w: {w['hazard']}.",
                remedy=f"Reduce {w['herb_name']} toward the documented safe limit ({w['safe_limit']}).",
            ))

    objections.append(PreFERObjection(
        section="Section 6",
        statute="Biological Diversity Act, 2002 (amended 2023)",
        severity="ADVISORY",
        finding="Applicant utilizes biological resources occurring in India. Mandatory NBA approval under Form III prior to patent grant is statutory.",
        remedy="File Form III with the National Biodiversity Authority (NBA) Chennai with the agreed ABS benefit-sharing schedule.",
    ))

    patentability_score = 45 if sim_res.sec_3e_status == "REJECTED" else (70 if sim_res.sec_3e_status == "BORDERLINE" else 92)

    claims = [
        f"1. A synergistic pharmaceutical/nutraceutical formulation comprising: {', '.join([f'{i.herb_id} ({i.ratio}% w/w)' for i in req.ingredients])}, wherein said composition demonstrates a Chou-Talalay Combination Index CI < {sim_res.chou_talalay_ci + 0.1}.",
        "2. The formulation as claimed in claim 1, wherein the bio-availability multiplier is at least 2.5-fold higher than unformulated active extracts.",
        "3. The formulation as claimed in claim 1, formulated as an oral dosage form selected from tablet, liposomal capsule, or nano-emulsion.",
    ]

    return PreFERResponse(
        application_no=None,
        filing_date=None,
        provenance="SERVER-DETERMINISTIC — engine scoring, not an IPO service response",
        examiner_group="Simulated IPO Group 14 (Ayurvedic Biotechnology & Phytopharmaceuticals)",
        overall_patentability_score=patentability_score,
        summary=(
            f"Pre-FER Examination completed for '{req.formulation_title}'. "
            f"Overall Patentability Score: {patentability_score}/100. "
            f"Section 3(e) Synergism status: {sim_res.sec_3e_status}. "
            f"Section 3(p) TKDL conflict: {'YES' if sim_res.tkdl_concordance_score >= 90 else 'NO'}."
        ),
        sec_3e_synergy_verified=(sim_res.sec_3e_status == "CLEARED"),
        sec_3p_tkdl_conflict=(sim_res.tkdl_concordance_score >= 90),
        objections=objections,
        wipo_gratk_status={
            "wipo_treaty": "WIPO GRATK Treaty 2024",
            "disclosure_obligation": "COMPLIANT — Source of Indian biological resources identified",
            "abs_clearance_status": sim_res.nba_form_tier,
        },
        recommended_claim_draft=claims,
    )
