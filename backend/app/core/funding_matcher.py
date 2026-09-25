"""
Funding & Loan Eligibility Matcher — deterministic rule engine.

Evaluates an enterprise profile against the curated scheme catalog
(see app/services/business_service.py + data/business/schemes.json) and returns
a ranked set of eligibility verdicts. No LLM, no network: every verdict is a
transparent rule with human-readable reasons and an official source citation.

This is an eligibility *matcher*, not a lender — it never sanctions credit.
"""

import logging
from typing import List

from app.models.schemas import FundingMatchRequest, FundingMatchResponse, SchemeMatch
from app.services import business_service as catalog
from app.services.business_service import Scheme

logger = logging.getLogger("app.funding_matcher")


def _inr(value: float) -> str:
    """Format a rupee amount compactly (lakh / crore), WITHOUT a currency symbol —
    callers prefix ₹ (band labels from the catalog carry their own ₹)."""
    if value >= 10_000_000:
        return f"{value / 10_000_000:g} Crore"
    if value >= 100_000:
        return f"{value / 100_000:g} Lakh"
    return f"{value:,.0f}"


def classify_msme_size(req: FundingMatchRequest) -> str:
    """Revised MSMED classification by investment (project cost) + turnover."""
    investment = req.project_cost
    turnover = req.turnover
    if investment <= 10_000_000 and turnover <= 50_000_000:
        return "micro"
    if investment <= 50_000_000 and turnover <= 500_000_000:
        return "small"
    if investment <= 200_000_000 and turnover <= 2_500_000_000:
        return "medium"
    return "large"


def _base_match(scheme: Scheme, status: str, reasons: List[str]) -> SchemeMatch:
    return SchemeMatch(
        id=scheme.id,
        name=scheme.name,
        aka=scheme.aka,
        ministry=scheme.ministry,
        status=status,
        benefit=scheme.benefit,
        docs=list(scheme.docs),
        portal_url=scheme.portal_url,
        citation=scheme.citation.model_dump(),
        reasons=reasons,
    )


def _match_mudra(scheme: Scheme, req: FundingMatchRequest) -> SchemeMatch:
    amount = req.loan_amount or req.project_cost
    reasons: List[str] = []
    if amount <= 0:
        return _base_match(scheme, "likely", ["Enter a loan / project amount to place you in a MUDRA band."])
    if amount > scheme.max_loan:
        return _base_match(
            scheme, "not_eligible",
            [f"₹{_inr(amount)} exceeds the MUDRA ceiling of ₹{_inr(scheme.max_loan)} (Tarun Plus). "
             "Consider CGTMSE-backed or term loans above this limit."],
        )
    band = "Shishu"
    bands = scheme.extra.get("bands", {})
    for key in ("shishu", "kishor", "tarun", "tarun_plus"):
        b = bands.get(key)
        if b and amount <= b["max"]:
            band = b["label"]
            break
    reasons.append(f"₹{_inr(amount)} falls in the '{band.split(' — ')[0]}' band (collateral-free).")
    reasons.append("Open to Indian citizens / entities with a non-farm income-generating activity.")
    if req.stage == "idea":
        reasons.append("MUDRA funds income-generating activities — a viable activity plan strengthens the case.")
    m = _base_match(scheme, "eligible", reasons)
    m.band = band
    m.amount_hint = band
    return m


def _match_pmegp(scheme: Scheme, req: FundingMatchRequest) -> SchemeMatch:
    reasons: List[str] = []
    cost = req.project_cost or req.loan_amount
    if cost <= 0:
        return _base_match(scheme, "likely",
                           ["Enter your project / plant & machinery cost to estimate the PMEGP subsidy."])
    caps = scheme.extra.get("sector_caps", {})
    cap = caps.get(req.sector, caps.get("service", 2_000_000))
    if req.stage == "established" and not req.is_greenfield:
        return _base_match(scheme, "not_eligible",
                           ["PMEGP supports *new* (greenfield) units only. An existing unit is not eligible."])
    if cost > cap:
        return _base_match(scheme, "not_eligible",
                           [f"Project cost ₹{_inr(cost)} exceeds the PMEGP cap of ₹{_inr(cap)} "
                            f"for a '{req.sector}' unit."])
    # Special-category (higher subsidy) = SC/ST/OBC/Minority or a woman entrepreneur.
    special = (req.social_category in scheme.extra.get("special_categories", ["sc", "st", "obc"])
               or req.is_woman)
    subsidy_map = scheme.extra.get("subsidy_model", {}).get("special" if special else "general", {})
    subsidy = subsidy_map.get(req.location, 0.15)
    contribution = 0.05 if special else 0.10
    reasons.append(f"Project cost ₹{_inr(cost)} is within the ₹{_inr(cap)} cap for '{req.sector}'.")
    reasons.append(f"Estimated margin-money subsidy ≈ {int(subsidy * 100)}% "
                   f"({'special' if special else 'general'} category, {req.location}); "
                   f"your contribution ≈ {int(contribution * 100)}%.")
    status = "eligible"
    if not req.udyam_registered:
        status = "locked"
        reasons.append("Udyam registration is required to file the PMEGP application.")
    m = _base_match(scheme, status, reasons)
    m.amount_hint = f"Up to {int(subsidy * 100)}% subsidy on ₹{_inr(cost)}"
    return m


def _match_standup(scheme: Scheme, req: FundingMatchRequest) -> SchemeMatch:
    reasons: List[str] = []
    amount = req.loan_amount or req.project_cost
    eligible_cat = req.is_woman or req.social_category in ("sc", "st")
    who = []
    if req.is_woman:
        who.append("woman")
    if req.social_category in ("sc", "st"):
        who.append(req.social_category.upper())
    if not eligible_cat:
        return _base_match(scheme, "not_eligible",
                           ["Stand-Up India is reserved for SC/ST and/or women entrepreneurs."])
    if not req.is_greenfield:
        return _base_match(scheme, "not_eligible",
                           ["Stand-Up India requires a greenfield (first-time) enterprise."])
    if amount and amount < scheme.min_loan:
        return _base_match(scheme, "likely",
                           [f"Eligible borrower ({'/'.join(who)}), greenfield — but ₹{_inr(amount)} is below the "
                            f"₹{_inr(scheme.min_loan)} minimum."])
    if amount and amount > scheme.max_loan:
        return _base_match(scheme, "likely",
                           [f"Eligible borrower ({'/'.join(who)}), greenfield — ₹{_inr(amount)} exceeds the stated "
                            f"ceiling (₹{_inr(scheme.max_loan)} after the 2025 relaunch uplift)."])
    reasons.append(f"Reserved category satisfied ({'/'.join(who)}).")
    reasons.append("Greenfield enterprise requirement satisfied.")
    reasons.append(f"Loan ₹{_inr(amount) if amount else '—'} within the ₹{_inr(scheme.min_loan)}–₹{_inr(scheme.max_loan)} window.")
    m = _base_match(scheme, "eligible", reasons)
    m.amount_hint = f"₹{_inr(scheme.min_loan)}–₹{_inr(scheme.max_loan)}"
    return m


def _match_cgtmse(scheme: Scheme, req: FundingMatchRequest, size: str) -> SchemeMatch:
    reasons: List[str] = []
    amount = req.loan_amount or req.project_cost
    if size not in ("micro", "small"):
        return _base_match(scheme, "not_eligible",
                           [f"CGTMSE covers micro & small enterprises only; your profile classifies as '{size}'."])
    if not req.wants_collateral_free:
        reasons.append("You indicated you can offer collateral — CGTMSE is still useful for enhancing credit.")
    if amount and amount > scheme.max_loan:
        return _base_match(scheme, "not_eligible",
                           [f"₹{_inr(amount)} exceeds the ₹{_inr(scheme.max_loan)} guarantee ceiling."])
    if not req.udyam_registered:
        return _base_match(scheme, "locked",
                           [f"Classified as a {size} enterprise (within the ₹{_inr(scheme.max_loan)} ceiling). "
                            "Udyam (MSME) registration is mandatory to avail the guarantee."])
    reasons.append(f"Classified as a {size} enterprise — within the ₹{_inr(scheme.max_loan)} collateral-free ceiling.")
    reasons.append("Both new and existing micro & small enterprises are coverable once Udyam-registered.")
    if req.is_woman:
        reasons.append("Women-entrepreneur benefit may apply.")
    m = _base_match(scheme, "eligible", reasons)
    m.amount_hint = f"Up to ₹{_inr(scheme.max_loan)} collateral-free"
    return m


def match_funding(req: FundingMatchRequest) -> FundingMatchResponse:
    size = classify_msme_size(req)
    evaluators = {
        "mudra": lambda s: _match_mudra(s, req),
        "pmegp": lambda s: _match_pmegp(s, req),
        "standup": lambda s: _match_standup(s, req),
        "cgtmse": lambda s: _match_cgtmse(s, req, size),
    }
    order = {"eligible": 0, "locked": 1, "likely": 2, "not_eligible": 3}
    matches: List[SchemeMatch] = []
    for scheme in catalog.get_schemes():
        fn = evaluators.get(scheme.id)
        matches.append(fn(scheme) if fn else _base_match(scheme, "likely", []))
    matches.sort(key=lambda m: order.get(m.status, 9))

    locked = any(m.status == "locked" for m in matches)
    return FundingMatchResponse(
        size_class=size,
        locked_udyam=locked,
        matches=matches,
        disclaimer=catalog.schemes_disclaimer(),
    )
