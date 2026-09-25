"""
Label Compliance Validator — deterministic element-presence checks.

Screens a draft label against the actual statutory labeling ruleset
(see data/business/labeling_rules.json) — AYUSH (D&C Rules Rule 161 / Schedule
E(1)) or FSSAI (Labelling & Display Regulations). Each checklist element is a
rule carrying its own primary-source citation, mirroring the platform's
"validate against the real regulation, not a generic checklist" approach.
"""

import logging
import re
from typing import List

from app.models.schemas import LabelCheckRequest, LabelCheckResponse, LabelFinding
from app.services import business_service as catalog
from app.services.business_service import LabelRuleset, LabelRequirement

logger = logging.getLogger("app.label_validator")

# Terms that push a product toward the food / nutraceutical ruleset when routing
# is not explicitly provided by the caller.
_FSSAI_HINTS = [
    "food", "juice", "drink", "honey", "sugar", "nutraceutical", "health supplement",
    "dietary", "protein", "sheera", "chyawanprash*food", "aahar", "ayurvedic aahar",
    "vegetable oil", "spice", "tea", "tonic", "syrup*food", "gummies", "bars",
]
_SEVERITY_WEIGHT = {"critical": 3, "major": 2, "minor": 1}


def _route_ruleset(req: LabelCheckRequest) -> str:
    """Explicit ruleset wins; otherwise infer ayush vs fssai from the draft."""
    if req.ruleset and catalog.get_ruleset(req.ruleset):
        return req.ruleset
    lowered = req.draft_text.lower()
    if any(h in lowered for h in _FSSAI_HINTS):
        return "fssai"
    return "ayush"


def _detect(raw: str, lowered: str, requirement: LabelRequirement) -> str:
    kw_hit = any(k.lower().strip() in lowered for k in requirement.keywords if k.strip())
    rx_hit = False
    if requirement.regex:
        try:
            rx_hit = bool(re.search(requirement.regex, raw, re.IGNORECASE))
        except re.error:
            logger.warning("invalid regex in rule %s: %s", requirement.id, requirement.regex)
            rx_hit = False
    if requirement.regex and rx_hit:
        return "present"
    if requirement.regex and kw_hit and not rx_hit:
        return "needs_review"  # concept mentioned but strict format unconfirmed
    if not requirement.regex and kw_hit:
        return "present"
    return "missing"


def check_label(req: LabelCheckRequest) -> LabelCheckResponse:
    key = _route_ruleset(req)
    ruleset: LabelRuleset = catalog.get_ruleset(key)
    raw = req.draft_text
    lowered = raw.lower()

    findings: List[LabelFinding] = []
    present = missing = critical_missing = 0
    total_weight = 0
    earned_weight = 0.0

    for rule in ruleset.requirements:
        status = _detect(raw, lowered, rule)
        findings.append(
            LabelFinding(
                id=rule.id,
                label=rule.label,
                status=status,
                severity=rule.severity,
                guidance=rule.guidance,
                citation=ruleset.citation.model_dump(),
            )
        )
        weight = _SEVERITY_WEIGHT.get(rule.severity, 2)
        total_weight += weight
        if status == "present":
            present += 1
            earned_weight += weight
        elif status == "needs_review":
            earned_weight += weight * 0.5
        else:  # missing
            missing += 1
            if rule.severity == "critical":
                critical_missing += 1

    # Order: critical misses first, then major/minor misses, then reviews, then present.
    _rank = {"missing": 0, "needs_review": 1, "present": 2}
    _sev = {"critical": 0, "major": 1, "minor": 2}
    findings.sort(key=lambda f: (_rank.get(f.status, 9), _sev.get(f.severity, 9)))

    score = round(earned_weight / total_weight * 100) if total_weight else 0
    return LabelCheckResponse(
        ruleset=key,
        ruleset_label=ruleset.label,
        authority=ruleset.authority,
        total=len(ruleset.requirements),
        present=present,
        missing=missing,
        critical_missing=critical_missing,
        score=score,
        findings=findings,
        citation=ruleset.citation.model_dump(),
        disclaimer=catalog.labeling_disclaimer(),
    )
