"""
Build-time preset scoring (formulation-lab-flow-spec.md §8.3).

Runs every preset in backend/data/formulation/presets.json through the real
engine and writes the results back as `computed` chips — so preset cards never
carry hand-declared numbers. CI test (tests/test_preset_labels.py) fails when a
declared value differs from a recomputed one.

Usage:  cd backend && python scripts/score_presets.py [--check]
  --check: don't write; exit non-zero if presets.json is stale/mislabelled.
"""

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.models.formulation import (  # noqa: E402
    FormulationSimulateRequest,
    IngredientRatioInput,
)
from app.core.formulation.engine import simulate_formulation  # noqa: E402

PRESETS_FILE = BACKEND_ROOT / "data" / "formulation" / "presets.json"

CHIP_KEYS = [
    "quality",
    "ci",
    "sec_3e_status",
    "tkdl_concordance_score",
    "tier",
    "nba_abs_royalty_percentage",
    "cost_per_unit",
]


def score_preset(preset: dict) -> dict:
    req = FormulationSimulateRequest(
        title=preset["id"],
        ingredients=[
            IngredientRatioInput(herb_id=i["herb_id"], ratio=i["ratio"])
            for i in preset["ingredients"]
        ],
    )
    sim = simulate_formulation(req)
    return {
        "quality": sim.medicine_quality_score,
        "ci": sim.chou_talalay_ci,
        "sec_3e_status": sim.sec_3e_status,
        "tkdl_concordance_score": sim.tkdl_concordance_score,
        "tier": str(sim.tier.value if hasattr(sim.tier, "value") else sim.tier),
        "nba_abs_royalty_percentage": sim.nba_abs_royalty_percentage,
        "cost_per_unit": sim.cost_per_unit,
    }


def main() -> int:
    check = "--check" in sys.argv
    with open(PRESETS_FILE, "r", encoding="utf-8") as f:
        presets = json.load(f)

    stale = []
    for preset in presets:
        computed = score_preset(preset)
        # target_tier must equal the engine's tier — no hand-declared labels.
        preset["target_tier"] = computed["tier"]
        previous = preset.get("computed")
        if previous != computed:
            stale.append(preset["id"])
            preset["computed"] = computed

    if check:
        if stale:
            print(f"PRESET LABELS STALE for: {', '.join(stale)}")
            print("Run: python scripts/score_presets.py")
            return 1
        print("All preset computed chips match the engine.")
        return 0

    with open(PRESETS_FILE, "w", encoding="utf-8") as f:
        json.dump(presets, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Scored {len(presets)} presets; updated: {', '.join(stale) if stale else 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
