"""
Unit tests for the Business Enablement deterministic engines:
funding matcher and label validator.
"""

from app.models.schemas import FundingMatchRequest, LabelCheckRequest
from app.core.funding_matcher import match_funding, classify_msme_size
from app.core.label_validator import check_label


def _status(resp, scheme_id):
    return {m.id: m for m in resp.matches}[scheme_id].status


# ─── Funding matcher ─────────────────────────────────────────────────

def test_msme_size_classification():
    micro = FundingMatchRequest(project_cost=5_000_000, turnover=20_000_000)
    small = FundingMatchRequest(project_cost=40_000_000, turnover=200_000_000)
    medium = FundingMatchRequest(project_cost=150_000_000, turnover=1_000_000_000)
    assert classify_msme_size(micro) == "micro"
    assert classify_msme_size(small) == "small"
    assert classify_msme_size(medium) == "medium"


def test_mudra_band_selection():
    r = FundingMatchRequest(stage="new", loan_amount=800_000, project_cost=800_000)
    resp = match_funding(r)
    m = {x.id: x for x in resp.matches}["mudra"]
    assert m.status == "eligible"
    assert "Tarun" in m.band


def test_mudra_rejects_above_ceiling():
    r = FundingMatchRequest(loan_amount=25_000_000, project_cost=25_000_000)
    resp = match_funding(r)
    assert _status(resp, "mudra") == "not_eligible"


def test_standup_requires_category_and_greenfield():
    # General, non-greenfield → not eligible
    r = FundingMatchRequest(is_woman=False, social_category="general", is_greenfield=False,
                            loan_amount=5_000_000, project_cost=5_000_000)
    assert _status(match_funding(r), "standup") == "not_eligible"

    # Woman, greenfield, ₹50 lakh → eligible
    r2 = FundingMatchRequest(is_woman=True, is_greenfield=True,
                             loan_amount=5_000_000, project_cost=5_000_000)
    assert _status(match_funding(r2), "standup") == "eligible"


def test_pmegp_udyam_lock_and_subsidy():
    r = FundingMatchRequest(stage="new", project_cost=800_000, sector="manufacturing",
                            location="rural", social_category="st", udyam_registered=False)
    m = {x.id: x for x in match_funding(r).matches}["pmegp"]
    assert m.status == "locked"  # needs Udyam
    assert "35%" in m.amount_hint  # special category, rural

    r2 = r.model_copy(update={"udyam_registered": True})
    assert _status(match_funding(r2), "pmegp") == "eligible"


def test_pmegp_woman_and_obc_qualify_special_subsidy():
    # General category but a woman entrepreneur → special (rural = 35%)
    woman = FundingMatchRequest(stage="new", project_cost=800_000, location="rural",
                                social_category="general", is_woman=True, udyam_registered=True)
    mw = {x.id: x for x in match_funding(woman).matches}["pmegp"]
    assert "35%" in mw.amount_hint

    # OBC rural → special 35%
    obc = FundingMatchRequest(stage="new", project_cost=800_000, location="rural",
                              social_category="obc", udyam_registered=True)
    mo = {x.id: x for x in match_funding(obc).matches}["pmegp"]
    assert "35%" in mo.amount_hint

    # General, not woman, urban → 15%
    gen = FundingMatchRequest(stage="new", project_cost=800_000, location="urban",
                              social_category="general", is_woman=False, udyam_registered=True)
    mg = {x.id: x for x in match_funding(gen).matches}["pmegp"]
    assert "15%" in mg.amount_hint


def test_pmegp_requires_project_cost():
    r = FundingMatchRequest(stage="new", project_cost=0, loan_amount=0)
    assert _status(match_funding(r), "pmegp") == "likely"


def test_cgtmse_requires_udyam_for_micro():
    r = FundingMatchRequest(project_cost=800_000, turnover=3_000_000, udyam_registered=False,
                            loan_amount=5_000_000)
    resp = match_funding(r)
    assert _status(resp, "cgtmse") == "locked"
    assert resp.locked_udyam is True


# ─── Label validator ─────────────────────────────────────────────────

COMPLETE_AYUSH_LABEL = """अश्वगन्धाद्य चूर्ण / Ashwagandhadya Churna
Manufactured by: Divya Ayurvedic Pvt Ltd, 12 MG Road, Indore.
Mfg. Lic. No. MHP-23-B/1122
Net Wt: 100 g  Batch No: A-204  Mfg Date: 09/2026  Exp Date: 08/2029
Ingredients: Withania somnifera root 100%
Dosage: 3-6 g twice daily. Keep this medicine out of the reach of children.
MRP ₹120 (inclusive of all taxes)."""


def test_ayush_ruleset_routes_and_scores_high():
    resp = check_label(LabelCheckRequest(draft_text=COMPLETE_AYUSH_LABEL))
    assert resp.ruleset == "ayush"
    assert resp.score >= 80
    assert resp.critical_missing == 0


def test_missing_license_flagged_critical():
    draft = (
        "Ashwagandha Churna. Net 100 g. Batch A-204. "
        "Mfg Date 09/2026. Exp Date 08/2029. Ingredients: Withania somnifera. MRP ₹120."
    )
    resp = check_label(LabelCheckRequest(draft_text=draft, ruleset="ayush"))
    by_id = {f.id: f for f in resp.findings}
    assert by_id["ayush-license-number"].status == "missing"
    assert by_id["ayush-license-number"].severity == "critical"


def test_fssai_routing_from_keywords():
    draft = "Amla Juice drink. FSSAI License No 10021032001234. Net 500 ml. Best before 12 months."
    resp = check_label(LabelCheckRequest(draft_text=draft))
    assert resp.ruleset == "fssai"
