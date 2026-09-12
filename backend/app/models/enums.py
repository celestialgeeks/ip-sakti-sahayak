"""
Enums for IP-SAKTI Sahayak.
"""

from enum import Enum


class Jurisdiction(str, Enum):
    """Jurisdiction scope for queries."""
    INDIA = "india"
    INTERNATIONAL = "international"
    BOTH = "both"


class IPCategory(str, Enum):
    """IP category types."""
    PATENT = "patent"
    TRADEMARK = "trademark"
    GI = "geographical_indication"
    COPYRIGHT = "copyright"
    DESIGN = "design"
    PLANT_VARIETY = "plant_variety"
    TRADE_SECRET = "trade_secret"
    ABS = "access_benefit_sharing"
    REGULATORY = "regulatory"
    CASE_LAW = "case_law"


class FormulationCategory(str, Enum):
    """Ayurvedic formulation regulatory categories."""
    CLASSICAL = "classical"
    PROPRIETARY = "proprietary"
    NEW_DRUG = "new_drug"
    PHYTOPHARMACEUTICAL = "phytopharmaceutical"
    AYURVEDA_AAHAR = "ayurveda_aahar"
    COSMETIC = "cosmetic"
    UNKNOWN = "unknown"


class ConfidenceLevel(str, Enum):
    """Answer confidence levels."""
    HIGH = "high"       # >85% — grounded in primary legislation
    MEDIUM = "medium"   # 60-85% — grounded in rules/commentary
    LOW = "low"         # <60% — insufficient sources


class Language(str, Enum):
    """Supported Indian languages via Sarvam AI."""
    ENGLISH = "en"
    HINDI = "hi"
    TAMIL = "ta"
    TELUGU = "te"
    KANNADA = "kn"
    MALAYALAM = "ml"
    BENGALI = "bn"
    MARATHI = "mr"
    GUJARATI = "gu"
    PUNJABI = "pa"
    ODIA = "or"
    SANSKRIT = "sa"


class QdrantCollection(str, Enum):
    """Qdrant collection names."""
    INDIA_IP_LAW = "india_ip_law"
    INDIA_REGULATORY = "india_regulatory"
    INDIA_BIODIVERSITY = "india_biodiversity"
    INDIA_TKDL = "india_tkdl"
    INTERNATIONAL_IP = "international_ip"
    INTERNATIONAL_MARKET = "international_market"
    CASE_LAW = "case_law"
