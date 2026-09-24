"""CLI: validate ayurveda library data files (schema + referential integrity).

Usage: python scripts/validate_ayurveda_data.py
Exit code 0 = valid; 1 = integrity errors (printed per-issue).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.ayurveda_service import AyurvedaLibrary, DataIntegrityError  # noqa: E402


def main() -> int:
    lib = AyurvedaLibrary()
    try:
        lib.load()
    except DataIntegrityError as e:
        print("INVALID:", file=sys.stderr)
        for part in str(e).split("; "):
            print(f"  - {part}", file=sys.stderr)
        return 1
    s = lib.stats()
    print(f"OK: {s['plants']} plants, {s['formulations']} formulations, "
          f"{s['conditions']} conditions (updated_at={s['updated_at']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
