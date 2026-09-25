"""
Business Enablement catalog service — funding schemes, suppliers, labeling rules.

Loads JSON catalogs from backend/data/business and validates them with Pydantic
schemas at first access (fail-fast), exactly like the ayurveda library service.
A malformed or missing file raises DataIntegrityError so the API surfaces a 503
rather than silently returning empty results.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger("app.services.business")

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "business"


class DataIntegrityError(RuntimeError):
    """Raised when a business catalog file is missing, malformed, or invalid."""


# ─── Schemas ─────────────────────────────────────────────────────────

class Citation(BaseModel):
    source: str = Field(min_length=1)
    url: str = ""


class Scheme(BaseModel):
    id: str
    name: str = Field(min_length=1)
    aka: str = ""
    ministry: str = ""
    kind: str = "loan"
    requires_udyam: bool = False
    collateral_free: bool = False
    min_loan: float = 0
    max_loan: float = 0
    benefit: str = ""
    docs: List[str] = Field(default_factory=list)
    portal_url: str = ""
    citation: Citation
    # scheme-specific tunables (bands, caps, subsidy model, eligible categories…)
    extra: Dict = Field(default_factory=dict)


class Supplier(BaseModel):
    id: str
    name: str = Field(min_length=1)
    region: str = ""
    state: str = ""
    materials: List[str] = Field(default_factory=list)
    gi_tags: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    website: str = ""
    verified: bool = False
    abs_note: str = ""


class LabelRequirement(BaseModel):
    id: str
    label: str = Field(min_length=1)
    guidance: str = ""
    keywords: List[str] = Field(default_factory=list)
    regex: str = ""
    severity: str = "major"  # critical | major | minor


class LabelRuleset(BaseModel):
    key: str
    label: str = ""
    authority: str = ""
    citation: Citation
    requirements: List[LabelRequirement] = Field(default_factory=list)


def _read(name: str) -> dict:
    path = DATA_DIR / name
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError as e:
        raise DataIntegrityError(f"missing business catalog: {name}") from e
    except json.JSONDecodeError as e:
        raise DataIntegrityError(f"invalid JSON in {name}: {e}") from e


# Scheme fields that are promoted onto the model; every other top-level key in
# the JSON (bands, sector_caps, subsidy_model, eligible_categories, …) is folded
# into Scheme.extra so scheme-specific tunables are preserved.
_SCHEME_CORE_FIELDS = {
    "id", "name", "aka", "ministry", "kind", "requires_udyam", "collateral_free",
    "min_loan", "max_loan", "benefit", "docs", "portal_url", "citation", "extra",
}


@lru_cache(maxsize=1)
def _schemes_doc() -> dict:
    doc = _read("schemes.json")
    schemes: List[Scheme] = []
    try:
        for s in doc["schemes"]:
            core = {k: v for k, v in s.items() if k in _SCHEME_CORE_FIELDS}
            extra = {k: v for k, v in s.items() if k not in _SCHEME_CORE_FIELDS}
            core["extra"] = extra
            schemes.append(Scheme(**core))
    except (ValidationError, KeyError) as e:
        raise DataIntegrityError(f"schemes.json failed validation: {e}") from e
    return {"disclaimer": doc.get("disclaimer", ""), "schemes": schemes}


@lru_cache(maxsize=1)
def _suppliers_doc() -> dict:
    doc = _read("suppliers.json")
    try:
        suppliers = [Supplier(**s) for s in doc["suppliers"]]
    except ValidationError as e:
        raise DataIntegrityError(f"suppliers.json failed validation: {e}") from e
    return {"disclaimer": doc.get("disclaimer", ""), "suppliers": suppliers}


@lru_cache(maxsize=1)
def _rulesets_doc() -> dict:
    doc = _read("labeling_rules.json")
    rulesets: Dict[str, LabelRuleset] = {}
    try:
        for key, rs in doc["rulesets"].items():
            rulesets[key] = LabelRuleset(key=key, **rs)
    except (ValidationError, KeyError) as e:
        raise DataIntegrityError(f"labeling_rules.json failed validation: {e}") from e
    return {"disclaimer": doc.get("disclaimer", ""), "rulesets": rulesets}


# ─── Public getters ──────────────────────────────────────────────────

def get_schemes() -> List[Scheme]:
    return _schemes_doc()["schemes"]


def get_scheme(scheme_id: str) -> Optional[Scheme]:
    for s in get_schemes():
        if s.id == scheme_id:
            return s
    return None


def schemes_disclaimer() -> str:
    return _schemes_doc()["disclaimer"]


def get_suppliers() -> List[Supplier]:
    return _suppliers_doc()["suppliers"]


def suppliers_disclaimer() -> str:
    return _suppliers_doc()["disclaimer"]


def get_rulesets() -> Dict[str, LabelRuleset]:
    return _rulesets_doc()["rulesets"]


def get_ruleset(key: str) -> Optional[LabelRuleset]:
    return _rulesets_doc()["rulesets"].get(key)


def labeling_disclaimer() -> str:
    return _rulesets_doc()["disclaimer"]


def preload() -> None:
    """Fail-fast load of all catalogs (called at app boot)."""
    _schemes_doc()
    _suppliers_doc()
    _rulesets_doc()
    logger.info(
        "Business catalogs loaded: %d schemes, %d suppliers, %d rulesets",
        len(get_schemes()), len(get_suppliers()), len(get_rulesets()),
    )
