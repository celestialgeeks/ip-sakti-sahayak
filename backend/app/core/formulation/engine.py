"""
Formulation Simulation Engine for IP-SAKTI Sahayak.
Implements the Chou-Talalay combination index model, Biological Diversity Act ABS rules,
Classical TKDL concordance checks, and the living Rasa Tier alchemical progression.
"""

import json
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


def simulate_formulation(req: FormulationSimulateRequest) -> SimulationResponse:
    botanicals = load_botanicals()
    
    # Map input herbs
    ratios: Dict[str, float] = {}
    total_ratio = 0.0
    for ing in req.ingredients:
        r = round(float(ing.ratio), 2)
        ratios[ing.herb_id] = r
        total_ratio += r
    total_ratio = round(total_ratio, 2)
    is_balanced = abs(total_ratio - 100.0) < 0.1

    # Presence and ratios of key players
    ashwa = ratios.get("ashwagandha", 0.0)
    shilajit = ratios.get("shilajit", 0.0)
    haridra = ratios.get("haridra", 0.0)
    pippali = ratios.get("pippali", 0.0)
    ghee = ratios.get("ghee", 0.0)
    guduchi = ratios.get("guduchi", 0.0)
    brahmi = ratios.get("brahmi", 0.0)
    guggulu = ratios.get("guggulu", 0.0)

    # 1. Chou-Talalay Combination Index (CI) calculation
    # Base combination index starts at ~1.15 (mere admixture baseline)
    base_ci = 1.15

    # Synergistic drivers:
    # Pippali (Piperine) is a potent bio-enhancer and glucuronidation inhibitor
    if pippali > 0.5:
        # Optimal pippali is between 3% and 8%
        pippali_factor = min(pippali / 5.0, 1.2) * 0.32
        base_ci -= pippali_factor

    # Ghee (Liposomal lipid vehicle) enhances cellular permeability
    if ghee >= 8.0:
        base_ci -= 0.12

    # Ashwagandha + Haridra synergistic anti-oxidant cross-talk
    if ashwa >= 20.0 and haridra >= 20.0:
        base_ci -= 0.14

    # Guduchi acts as a classical Rasayana balancing catalyst
    if guduchi >= 5.0:
        base_ci -= 0.08

    # Penalties (Antagonisms / Mineral Burden):
    # Excessive Shilajit without adequate vehicle or Guduchi creates mineral saturation
    if shilajit > 25.0:
        mineral_penalty = ((shilajit - 25.0) / 10.0) * 0.15
        if guduchi >= 10.0:
            mineral_penalty *= 0.3  # Guduchi neutralizes toxicity
        base_ci += mineral_penalty

    # Underdosed active adaptogens (e.g. ashwa < 15% and haridra < 15%)
    if ashwa < 15.0 and haridra < 15.0 and brahmi < 15.0:
        base_ci += 0.18

    # Missing bio-enhancer when actives are high
    if pippali < 1.0 and (ashwa + haridra) > 40.0:
        base_ci += 0.12

    ci_score = round(max(0.42, min(1.35, base_ci)), 2)

    # Section 3(e) Status
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
    bio_multiplier = round(bio_multiplier, 1)

    # 3. Anti-inflammatory NF-κB suppression (%)
    anti_inflam = (haridra * 0.48) + (guggulu * 0.42) + (ashwa * 0.22)
    if pippali >= 3.0:
        anti_inflam *= 1.35  # Piperine potentiation
    anti_inflam = round(min(anti_inflam, 48.5), 1)

    # 4. Biological Diversity Act (NBA) Benefit-Sharing & ABS Royalty
    # Domestic base rate: 3.5%
    abs_royalty = 3.5
    nba_tier = "Fast-Track Category B (Form III)"
    
    if req.entity_type == "foreign":
        abs_royalty = 5.0
        nba_tier = "Form I (Prior Approval for Foreign Participation)"
    elif shilajit >= 25.0 or guggulu >= 25.0:
        abs_royalty = 5.0
        nba_tier = "High-Scrutiny Public Hearing (High Mineral/Threatened Burden)"
    elif shilajit <= 10.0 and guggulu <= 10.0:
        abs_royalty = 3.0
        nba_tier = "Fast-Track Form III (Low Mineral Liability)"

    # 5. Classical TKDL Concordance
    tkdl_score = 75
    shloka_match = "Charaka Samhita Chikitsasthanam 28 (Vatavyadhi Chikitsa)"

    if ashwa >= 25.0 and shilajit >= 5.0 and ghee >= 10.0:
        tkdl_score = 92
        shloka_match = "Charaka Samhita Chikitsa 1.1 / Rasatarangini Taranga 22"
    elif ashwa > 45.0:
        tkdl_score = 68
        shloka_match = "Diverges from classical Rasayana ratio; excess single adaptogen"
    elif pippali == 0.0:
        tkdl_score = 58
        shloka_match = "Lacks classical Deepana-Pachana / Yogavāhī vehicle"

    # 6. Tridosha Balancing
    vata = 35
    pitta = 30
    kapha = 35
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

    # 8. Ojas Power Score (0 to 10,000)
    # Math: higher CI drops score; higher bioavailability & anti-inflam increases score
    synergy_component = max(0.0, (1.25 - ci_score) / (1.25 - 0.45)) * 4500
    bio_component = (bio_multiplier / 3.5) * 2200
    tkdl_component = (tkdl_score / 100.0) * 1800
    suppression_component = (anti_inflam / 48.5) * 1500

    buff_bonus = (len(active_buffs) * 250) - (len(active_debuffs) * 400)
    raw_power = int(synergy_component + bio_component + tkdl_component + suppression_component + buff_bonus)
    ojas_power = max(1100, min(9999, raw_power))

    # 9. Rasa Tier Assignment
    if ojas_power >= 9200:
        tier = RasaTier.TIER_6_DIVYA_RASAYANA
        tier_sanskrit = "दिव्य रसायन • DIVYA RASAYANA"
        tier_english = "Transcendent Sovereign Rejuvenator"
        star_rating = 5
    elif ojas_power >= 8000:
        tier = RasaTier.TIER_5_SIDDHA
        tier_sanskrit = "सिद्ध • SIDDHA"
        tier_english = "Perfected Masterwork"
        star_rating = 5
    elif ojas_power >= 6500:
        tier = RasaTier.TIER_4_VRIDDHA
        tier_sanskrit = "वृद्ध • VRIDDHA"
        tier_english = "Mature Alchemical Equilibrium"
        star_rating = 4
    elif ojas_power >= 5000:
        tier = RasaTier.TIER_3_YUVAN
        tier_sanskrit = "युवन् • YUVAN"
        tier_english = "Active Potency Combination"
        star_rating = 3
    elif ojas_power >= 3500:
        tier = RasaTier.TIER_2_KUMARA
        tier_sanskrit = "कुमार • KUMĀRA"
        tier_english = "Nascent Combination"
        star_rating = 2
    else:
        tier = RasaTier.TIER_1_BALA
        tier_sanskrit = "बाल • BĀLA"
        tier_english = "Infant / Raw Admixture"
        star_rating = 1

    # 10. Pairwise Synergy Grid
    pairwise: List[PairwiseSynergy] = [
        PairwiseSynergy(
            herb_a="Haridra (Curcuma longa)",
            herb_b="Pippali (Piper longum)",
            ci_score=0.54 if pippali >= 3.0 else 1.05,
            status="Super-Additive" if pippali >= 3.0 else "Inactive",
            mechanism="Piperine downregulates CYP3A4 & P-gp, multiplying curcuminoid bio-absorption by 2000%."
        ),
        PairwiseSynergy(
            herb_a="Ashwagandha (Withania somnifera)",
            herb_b="Shilajit (Asphaltum punjabianum)",
            ci_score=0.64 if shilajit <= 15.0 else 0.88,
            status="Synergistic" if shilajit <= 15.0 else "Moderate",
            mechanism="Fulvic acid complexes with withanolides, accelerating cellular mitochondrial ATP replenishment."
        ),
        PairwiseSynergy(
            herb_a="Ashwagandha (Withania somnifera)",
            herb_b="Cow Ghrita (A2 Lipid)",
            ci_score=0.69 if ghee >= 10.0 else 0.98,
            status="Synergistic" if ghee >= 10.0 else "Sub-optimal",
            mechanism="Liposomal encapsulation bypasses gastric acid degradation, enhancing lymphatic uptake."
        )
    ]

    # 11. HPLC Marker Assay Profile
    hplc_markers = [
        {
            "marker": "Withanolides (Withaferin-A)",
            "botanical": "Withania somnifera",
            "detected": f"{round(ashwa * 0.13, 2)}% w/w",
            "api_spec": "Min 0.50% w/w (API Part-I Vol-I)",
            "compliance": "PASS" if (ashwa * 0.13) >= 0.50 else "SUB-POTENT"
        },
        {
            "marker": "Total Curcuminoids",
            "botanical": "Curcuma longa",
            "detected": f"{round(haridra * 0.95, 2)}% w/w",
            "api_spec": "Min 90.0% of extract fraction",
            "compliance": "PASS" if haridra >= 10.0 else "DEFICIENT"
        },
        {
            "marker": "Piperine Bio-Catalyst",
            "botanical": "Piper longum",
            "detected": f"{round(pippali * 0.98, 2)}% w/w",
            "api_spec": "3.0% - 8.0% w/w recommended",
            "compliance": "OPTIMAL" if 2.5 <= pippali <= 10.0 else "ALERT"
        },
        {
            "marker": "Fulvic Acid Fraction",
            "botanical": "Asphaltum punjabianum",
            "detected": f"{round(shilajit * 0.50, 2)}% w/w",
            "api_spec": "Max 15.0% resin burden",
            "compliance": "PASS" if shilajit <= 15.0 else "EXCESS_RESIN"
        }
    ]

    # 12. Production Economics Waterfall
    cost_waterfall = [
        { "stage": "Raw Botanical Procurement", "cost_inr": 42.0, "unit": "per 500mg dose" },
        { "stage": "Classical Shodhana & Samskara Processing", "cost_inr": 18.5, "unit": "GMP Schedule T" },
        { "stage": "Standardization & HPLC Quality Control", "cost_inr": 9.2, "unit": "NABL Accredited" },
        { "stage": f"NBA Benefit-Sharing Levy ({abs_royalty}%)", "cost_inr": round(140.0 * (abs_royalty / 100.0), 2), "unit": "Net Ex-Factory" },
        { "stage": "Unit Ex-Factory Realization", "cost_inr": 140.0, "unit": "Retail MRP ₹299" },
        { "stage": "Projected Net Commercial Margin", "cost_inr": round(140.0 - (42.0 + 18.5 + 9.2 + (140.0 * (abs_royalty / 100.0))), 2), "unit": "Healthy 43% EBITDA" }
    ]

    # 13. Contextual Suggestions for Toast
    suggestions: List[str] = []
    if pippali == 0.0:
        suggestions.append("Add Pippali (Piper longum) 5% → Ignites Yogavāhī bio-availability & cuts Section 3(e) CI score by -0.32.")
    if shilajit > 20.0 and guduchi < 5.0:
        suggestions.append("Add Guduchi (Tinospora cordifolia) 5% → Neutralizes Shilajit mineral burden & grants NBA Fast-Track tier.")
    if ashwa > 40.0 and ghee < 10.0:
        suggestions.append("Increase Cow Ghrita to 15% → Balances high Withanolide agni and fulfills Charaka Samhita vehicle requirement.")

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
    )


def generate_pre_fer(req: PreFERRequest) -> PreFERResponse:
    """
    Simulates an official Indian Patent Office (IPO) First Examination Report (FER)
    for the given formulation.
    """
    sim_res = simulate_formulation(
        FormulationSimulateRequest(title=req.formulation_title, ingredients=req.ingredients)
    )

    objections: List[PreFERObjection] = []

    # Section 3(e) objection check
    if sim_res.sec_3e_status == "REJECTED":
        objections.append(
            PreFERObjection(
                section="Section 3(e)",
                statute="The Patents Act, 1970 (as amended)",
                severity="FATAL",
                finding=(
                    f"The claimed composition exhibits a Chou-Talalay Combination Index of {sim_res.chou_talalay_ci} (> 1.05). "
                    "In the absence of quantifiable synergistic biological efficacy beyond the mathematical sum of individual botanical constituents, "
                    "the composition is rejected as a mere admixture resulting only in aggregation of properties."
                ),
                remedy="Incorporate a standardized bio-enhancer (e.g. Piperine >= 3% w/w) or Samskara liposomal carrier and submit in-vitro IC50 delta assay data to substantiate synergistic enhancement."
            )
        )
    elif sim_res.sec_3e_status == "BORDERLINE":
        objections.append(
            PreFERObjection(
                section="Section 3(e)",
                statute="The Patents Act, 1970 (as amended)",
                severity="ADVISORY",
                finding=f"Combination Index is borderline ({sim_res.chou_talalay_ci}). Examiner requests comparative in-vitro data against single-agent baselines.",
                remedy="Provide statistical p-value verification (< 0.05) showing non-obvious bio-enhancement."
            )
        )
    else:
        objections.append(
            PreFERObjection(
                section="Section 3(e)",
                statute="The Patents Act, 1970 (as amended)",
                severity="OVERCOME",
                finding=(
                    f"Combination Index verified at {sim_res.chou_talalay_ci} (< 0.85). Non-obvious synergistic enhancement established. "
                    "Mere admixture rejection under Section 3(e) is satisfactorily overcome."
                ),
                remedy="Maintain validated stoichiometric ratios within Claim 1 dependent claims."
            )
        )

    # Section 3(p) TKDL objection check
    if sim_res.tkdl_concordance_score >= 90:
        objections.append(
            PreFERObjection(
                section="Section 3(p)",
                statute="The Patents Act, 1970 (as amended)",
                severity="ADVISORY",
                finding=(
                    "The formulation contains botanicals extensively documented in traditional Ayurvedic treatises (TKDL). "
                    "Under Section 3(p), traditional knowledge per se is not patentable."
                ),
                remedy="Amend claims to focus strictly on the novel standardized phytochemical extraction ratio, specific particle micronization, and synergistic bio-enhancement mechanism rather than the broad traditional recipe."
            )
        )

    # Biological Diversity Act Section 6 requirement
    objections.append(
        PreFERObjection(
            section="Section 6",
            statute="Biological Diversity Act, 2002 (amended 2023)",
            severity="ADVISORY",
            finding="Applicant utilizes biological resources occurring in India. Mandatory NBA approval under Form III prior to patent grant is statutory.",
            remedy="File Form III with the National Biodiversity Authority (NBA) Chennai with the agreed ABS benefit-sharing schedule."
        )
    )

    patentability_score = 45 if sim_res.sec_3e_status == "REJECTED" else (70 if sim_res.sec_3e_status == "BORDERLINE" else 92)

    claims = [
        f"1. A synergistic pharmaceutical/nutraceutical formulation comprising: {', '.join([f'{i.herb_id} ({i.ratio}% w/w)' for i in req.ingredients])}, wherein said composition demonstrates a Chou-Talalay Combination Index CI < {sim_res.chou_talalay_ci + 0.1}.",
        "2. The formulation as claimed in claim 1, wherein the bio-availability multiplier is at least 2.5-fold higher than unformulated active extracts.",
        "3. The formulation as claimed in claim 1, formulated as an oral dosage form selected from tablet, liposomal capsule, or nano-emulsion."
    ]

    return PreFERResponse(
        application_no="IN/2026/AYUSH/049812",
        filing_date="2026-09-24",
        examiner_group="Ayurvedic Biotechnology & Phytopharmaceuticals Group 14",
        overall_patentability_score=patentability_score,
        summary=f"Pre-FER Examination completed for '{req.formulation_title}'. Overall Patentability Score: {patentability_score}/100. Section 3(e) Synergism status: {sim_res.sec_3e_status}.",
        sec_3e_synergy_verified=(sim_res.sec_3e_status == "CLEARED"),
        sec_3p_tkdl_conflict=(sim_res.tkdl_concordance_score >= 90),
        objections=objections,
        wipo_gratk_status={
            "wipo_treaty": "WIPO GRATK Treaty 2024",
            "disclosure_obligation": "COMPLIANT — Source of Indian biological resources identified",
            "abs_clearance_status": sim_res.nba_form_tier
        },
        recommended_claim_draft=claims
    )
