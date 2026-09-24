"""
Ayurvedic Library Service — curated botanical & formulation reference.

Loads JSON data files from backend/data/ayurveda, validates them with Pydantic
schemas at startup (fail-fast), builds in-memory indexes for O(1) id lookup and
tokenized relevance-ranked search, and exposes stats / related-entry helpers.

Silent failures are not acceptable: a malformed or missing data file raises
DataIntegrityError at load time so health checks and boot surface it loudly.
"""

import json
import logging
import re
import unicodedata
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator

logger = logging.getLogger("app.services.ayurveda")

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "ayurveda"


class DataIntegrityError(RuntimeError):
    """Raised when an ayurveda data file is missing, malformed, or invalid."""


# ─── Schemas (Pydantic validation at load time) ──────────────────────

class Plant(BaseModel):
    id: str
    sanskrit_name: str = Field(min_length=1)
    botanical_name: str = Field(min_length=1)
    family: str = ""
    english_name: str = ""
    vernacular_names: dict[str, str] = Field(default_factory=dict)
    rasa: list[str] = Field(default_factory=list)
    virya: str = ""
    vipaka: str = ""
    guna: list[str] = Field(default_factory=list)
    doshas_balanced: list[str] = Field(default_factory=list)
    prabhava: str = ""
    parts_used: list[str] = Field(default_factory=list)
    traditional_uses: list[str] = Field(default_factory=list)
    formulations: list[str] = Field(default_factory=list)
    active_constituents: list[str] = Field(default_factory=list)
    typical_dosage: str = ""
    safety_notes: str = ""
    contraindications: list[str] = Field(default_factory=list)
    interactions: list[str] = Field(default_factory=list)
    gi_status: Optional[str] = None
    ip_notes: str = ""

    @field_validator("doshas_balanced")
    @classmethod
    def _valid_doshas(cls, v: list[str]) -> list[str]:
        allowed = {"Vata", "Pitta", "Kapha"}
        bad = [d for d in v if d not in allowed]
        if bad:
            raise ValueError(f"invalid dosha values: {bad} (allowed: {sorted(allowed)})")
        return v


class Formulation(BaseModel):
    id: str
    name: str = Field(min_length=1)
    sanskrit_name: str = ""
    type: str = "Arishta"  # Churna | Kwatha | Arishta | Vati | Taila | Ghrita | Bhasma | Karma
    category: str = "classical"
    ingredients: list[str] = Field(default_factory=list)   # plant ids
    preparation_method: str = ""
    therapeutic_uses: list[str] = Field(default_factory=list)
    dosage: str = ""
    shelf_life: str = ""
    regulatory_notes: str = ""
    schedule_t_ref: str = ""
    ip_notes: str = ""
    safety_notes: str = ""


class Condition(BaseModel):
    id: str
    name: str = Field(min_length=1)
    sanskrit_name: str = ""
    description: str = ""
    modern_equivalents: list[str] = Field(default_factory=list)
    related_plants: list[str] = Field(default_factory=list)
    related_formulations: list[str] = Field(default_factory=list)
    ip_notes: str = ""


class LibraryMeta(BaseModel):
    updated_at: str = ""
    disclaimer: str = ""


# Normalization: case/accent-insensitive, Devanagari transliteration-agnostic


def normalize(text: str) -> str:
    """Lowercase, strip diacritics, collapse non-alphanumerics to spaces."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


_TOKEN_RE = re.compile(r"[a-z0-9\u0900-\u097F]+")


def tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


class AyurvedaLibrary:
    """Loaded, validated, indexed view of the ayurveda data files."""

    def __init__(self) -> None:
        self.meta = LibraryMeta()
        self.plants: list[Plant] = []
        self.formulations: list[Formulation] = []
        self.conditions: list[Condition] = []
        self._plant_by_id: dict[str, Plant] = {}
        self._formulation_by_id: dict[str, Formulation] = {}
        self._condition_by_id: dict[str, Condition] = {}
        # token -> list of (entry_dict, weight_field) postings for ranking
        self._index: dict[str, list[tuple[str, str]]] = {}
        self.loaded_from: list[str] = []

    # ── Loading & validation ─────────────────────────────────────────

    def load(self) -> None:
        errors: list[str] = []
        plants_raw = self._read_json("plants.json", "plants", errors)
        forms_raw = self._read_json("formulations.json", "formulations", errors)
        cond_raw = self._read_json("conditions.json", "conditions", errors)

        if errors:
            raise DataIntegrityError("; ".join(errors))

        try:
            self.meta = LibraryMeta(updated_at=plants_raw.get("updated_at", ""),
                                    disclaimer=plants_raw.get("disclaimer", ""))
            self.plants = [Plant.model_validate(p) for p in plants_raw["plants"]]
            self.formulations = [Formulation.model_validate(f) for f in forms_raw["formulations"]]
            self.conditions = [Condition.model_validate(c) for c in cond_raw["conditions"]]
        except ValidationError as e:
            raise DataIntegrityError(f"Ayurveda data failed schema validation: {e}") from e

        self._check_referential_integrity(errors)
        if errors:
            raise DataIntegrityError("; ".join(errors))

        self._build_indexes()
        logger.info(
            "Ayurveda library loaded: %d plants, %d formulations, %d conditions (%s)",
            len(self.plants), len(self.formulations), len(self.conditions),
            ", ".join(self.loaded_from),
        )

    def _read_json(self, filename: str, list_key: str,
                   errors: list[str]) -> dict[str, Any]:
        path = DATA_DIR / filename
        if not path.exists():
            errors.append(f"required data file missing: {path}")
            return {list_key: []}
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"{filename}: malformed JSON at line {e.lineno} col {e.colno}: {e.msg}")
            return {list_key: []}
        if not isinstance(data, dict) or not isinstance(data.get(list_key), list):
            errors.append(f"{filename}: expected an object with a '{list_key}' array")
            return {list_key: []}
        self.loaded_from.append(filename)
        return data

    def _check_referential_integrity(self, errors: list[str]) -> None:
        plant_ids = {p.id for p in self.plants}
        form_ids = {f.id for f in self.formulations}
        dupes = len(plant_ids) != len(self.plants) or len(form_ids) != len(self.formulations)
        if dupes:
            errors.append("duplicate entry ids detected across plants/formulations")
        for f in self.formulations:
            unknown = [i for i in f.ingredients if i not in plant_ids]
            if unknown:
                errors.append(f"formulation '{f.id}' references unknown plant ids: {unknown}")
        for c in self.conditions:
            bad_p = [i for i in c.related_plants if i not in plant_ids]
            bad_f = [i for i in c.related_formulations if i not in form_ids]
            if bad_p or bad_f:
                errors.append(
                    f"condition '{c.id}' has dangling refs"
                    + (f" plants={bad_p}" if bad_p else "")
                    + (f" formulations={bad_f}" if bad_f else "")
                )

    def _build_indexes(self) -> None:
        self._plant_by_id = {p.id: p for p in self.plants}
        self._formulation_by_id = {f.id: f for f in self.formulations}
        self._condition_by_id = {c.id: c for c in self.conditions}
        self._index = {}

        def add_tokens(entry_key: str, field: str, text: str) -> None:
            for tok in tokenize(normalize(text)):
                postings = self._index.setdefault(tok, [])
                if (entry_key, field) not in postings:
                    postings.append((entry_key, field))

        for p in self.plants:
            key = f"plant:{p.id}"
            add_tokens(key, "sanskrit_name", p.sanskrit_name)
            add_tokens(key, "botanical_name", p.botanical_name)
            add_tokens(key, "english_name", p.english_name)
            add_tokens(key, "vernacular", " ".join(p.vernacular_names.values()))
            add_tokens(key, "family", p.family)
            for lst in (p.traditional_uses, p.formulations, p.active_constituents,
                        p.rasa, p.prabhava.split(",")):
                add_tokens(key, "uses", " ".join(lst))

        for f in self.formulations:
            key = f"formulation:{f.id}"
            add_tokens(key, "name", f.name)
            add_tokens(key, "sanskrit_name", f.sanskrit_name)
            add_tokens(key, "type", f.type)
            add_tokens(key, "uses", " ".join(f.therapeutic_uses))

        for c in self.conditions:
            key = f"condition:{c.id}"
            add_tokens(key, "name", c.name)
            add_tokens(key, "sanskrit_name", c.sanskrit_name)
            add_tokens(key, "modern", " ".join(c.modern_equivalents))
            add_tokens(key, "description", c.description)

    # ── Queries ──────────────────────────────────────────────────────

    def get_plant(self, plant_id: str) -> Optional[Plant]:
        return self._plant_by_id.get(normalize_slug(plant_id))

    def get_formulation(self, fid: str) -> Optional[Formulation]:
        return self._formulation_by_id.get(normalize_slug(fid))

    def get_condition(self, cid: str) -> Optional[Condition]:
        return self._condition_by_id.get(normalize_slug(cid))

    def find_plant_by_name(self, name: str) -> Optional[Plant]:
        """Canonical slug/name lookup used by chat grounding and cross-links."""
        norm = normalize(name)
        for p in self.plants:
            candidates = [p.id, p.sanskrit_name, p.botanical_name, p.english_name,
                          *p.vernacular_names.values()]
            if any(norm == normalize(c) or norm in normalize(c) or normalize(c) in norm
                   for c in candidates if c):
                return p
        return None

    # Relevance weights per matched field
    _FIELD_WEIGHT = {
        "id": 12.0, "sanskrit_name": 10.0, "name": 10.0, "botanical_name": 9.0,
        "english_name": 8.0, "vernacular": 7.0, "modern": 6.0, "type": 5.0,
        "family": 4.0, "uses": 2.0, "description": 1.0,
    }

    def search(self, query: str, *, types: Optional[list[str]] = None,
               dosha: Optional[str] = None, rasa: Optional[str] = None,
               virya: Optional[str] = None, page: int = 1, page_size: int = 20,
               ) -> tuple[list[dict], int]:
        """Relevance-ranked search. Returns (results_page, total_count)."""
        tokens = tokenize(normalize(query)) if query else []
        want = set(types or {"plant", "formulation", "condition"})

        scores: dict[str, float] = {}
        for tok in tokens:
            # prefix match on last token helps partial typing ("ashwa")
            matches = dict.fromkeys([tok]) if tok in self._index else {}
            if not matches and tok == tokens[-1]:
                for t in self._index:
                    if t.startswith(tok):
                        matches[t] = None
            for t in matches:
                for key, field in self._index.get(t, []):
                    if key.split(":")[0] not in want:
                        continue
                    w = self._FIELD_WEIGHT.get(field, 1.0)
                    # exact whole-token match beats mere presence in long text
                    scores[key] = scores.get(key, 0.0) + w

        results: list[dict] = []
        for key, score in sorted(scores.items(), key=lambda kv: (-kv[1], kv[0])):
            kind, ident = key.split(":", 1)
            if kind == "plant":
                p = self._plant_by_id[ident]
                if dosha and dosha.title() not in p.doshas_balanced:
                    continue
                if rasa and not any(normalize(rasa) in normalize(r) for r in p.rasa):
                    continue
                if virya and not any(normalize(virya) in normalize(p.virya) for _ in [0]):
                    continue
                results.append({
                    "type": "plant", "id": p.id, "score": round(score, 2),
                    "title": p.sanskrit_name, "subtitle": p.botanical_name,
                    "doshas_balanced": p.doshas_balanced,
                    "safety_flag": bool(p.contraindications or "toxic" in p.safety_notes.lower()),
                })
            elif kind == "formulation":
                f = self._formulation_by_id[ident]
                results.append({
                    "type": "formulation", "id": f.id, "score": round(score, 2),
                    "title": f.name, "subtitle": f.type,
                    "category": f.category,
                })
            else:
                c = self._condition_by_id[ident]
                results.append({
                    "type": "condition", "id": c.id, "score": round(score, 2),
                    "title": c.name, "subtitle": c.sanskrit_name,
                })

        total = len(results)
        start = max(page - 1, 0) * page_size
        return results[start:start + page_size], total

    def filter_plants(self, *, dosha: Optional[str] = None, rasa: Optional[str] = None,
                      virya: Optional[str] = None, family: Optional[str] = None,
                      page: int = 1, page_size: int = 20,
                      ) -> tuple[list[dict], int]:
        out = []
        for p in self.plants:
            if dosha and dosha.title() not in p.doshas_balanced:
                continue
            if rasa and not any(normalize(rasa) in normalize(r) for r in p.rasa):
                continue
            if virya and normalize(virya) not in normalize(p.virya):
                continue
            if family and normalize(family) not in normalize(p.family):
                continue
            out.append({"id": p.id, "sanskrit_name": p.sanskrit_name,
                        "botanical_name": p.botanical_name, "english_name": p.english_name,
                        "doshas_balanced": p.doshas_balanced})
        total = len(out)
        start = max(page - 1, 0) * page_size
        return out[start:start + page_size], total

    def related(self, entry_type: str, entry_id: str) -> list[dict]:
        """Cross-linked entries (plant <-> formulation <-> condition)."""
        rel: list[dict] = []
        seen: set[str] = set()

        def push(item: dict) -> None:
            k = f"{item['type']}:{item['id']}"
            if k not in seen:
                seen.add(k)
                rel.append(item)

        if entry_type == "plant":
            p = self.get_plant(entry_id)
            if not p:
                return []
            for f in self.formulations:
                if p.id in f.ingredients:
                    push({"type": "formulation", "id": f.id, "title": f.name,
                          "relation": "contains this herb"})
            for c in self.conditions:
                if p.id in c.related_plants:
                    push({"type": "condition", "id": c.id, "title": c.name,
                          "relation": "traditionally used for"})
        elif entry_type == "formulation":
            f = self.get_formulation(entry_id)
            if not f:
                return []
            for pid in f.ingredients:
                p = self._plant_by_id.get(pid)
                if p:
                    push({"type": "plant", "id": p.id, "title": p.sanskrit_name,
                          "relation": "ingredient"})
            for c in self.conditions:
                if f.id in c.related_formulations:
                    push({"type": "condition", "id": c.id, "title": c.name,
                          "relation": "indicated for"})
        elif entry_type == "condition":
            c = self.get_condition(entry_id)
            if not c:
                return []
            for pid in c.related_plants:
                p = self._plant_by_id.get(pid)
                if p:
                    push({"type": "plant", "id": p.id, "title": p.sanskrit_name,
                          "relation": "traditional remedy"})
            for fid in c.related_formulations:
                f = self._formulation_by_id.get(fid)
                if f:
                    push({"type": "formulation", "id": f.id, "title": f.name,
                          "relation": "classical formulation"})
        return rel

    def stats(self) -> dict:
        families = {p.family for p in self.plants if p.family}
        gi_count = sum(1 for p in self.plants if p.gi_status)
        flagged = sum(1 for p in self.plants if p.contraindications)
        return {
            "plants": len(self.plants),
            "formulations": len(self.formulations),
            "conditions": len(self.conditions),
            "families": len(families),
            "gi_tagged_plants": gi_count,
            "plants_with_safety_flags": flagged,
            "updated_at": self.meta.updated_at,
            "disclaimer": self.meta.disclaimer,
        }

    def grounding_context(self, query: str, limit: int = 3) -> str:
        """Compact curated context block injected into RAG prompts for herb Q&A."""
        hits, _ = self.search(query, page_size=limit)
        blocks: list[str] = []
        for h in hits[:limit]:
            if h["type"] == "plant":
                p = self._plant_by_id[h["id"]]
                blocks.append(
                    f"[{p.sanskrit_name} / {p.botanical_name}] "
                    f"Rasa: {', '.join(p.rasa)}; Virya: {p.virya}; Vipaka: {p.vipaka}; "
                    f"Balances: {', '.join(p.doshas_balanced)}. "
                    f"Uses: {'; '.join(p.traditional_uses)}. "
                    f"Dosage: {p.typical_dosage}. Safety: {p.safety_notes} "
                    f"IP: {p.ip_notes}"
                )
            elif h["type"] == "formulation":
                f = self._formulation_by_id[h["id"]]
                blocks.append(
                    f"[{f.name}] Type {f.type}, category {f.category}. "
                    f"Ingredients: {', '.join(f.ingredients)}. Uses: {'; '.join(f.therapeutic_uses)}. "
                    f"Regulatory: {f.regulatory_notes} IP: {f.ip_notes}"
                )
            else:
                c = self._condition_by_id[h["id"]]
                blocks.append(
                    f"[{c.name} ({c.sanskrit_name})] {c.description} "
                    f"Modern equivalents: {', '.join(c.modern_equivalents)}. IP: {c.ip_notes}"
                )
        return "\n".join(blocks)


def normalize_slug(value: str) -> str:
    """Canonical id form: lowercase, alphanumerics separated by single hyphens."""
    value = normalize(value)
    return re.sub(r"\s+", "-", value).strip("-")


_library: Optional[AyurvedaLibrary] = None


def get_library(reload: bool = False) -> AyurvedaLibrary:
    """Process-wide singleton; raises DataIntegrityError loudly on bad data."""
    global _library
    if _library is None or reload:
        lib = AyurvedaLibrary()
        lib.load()
        _library = lib
    return _library
