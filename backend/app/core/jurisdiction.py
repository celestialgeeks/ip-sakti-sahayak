"""
Jurisdiction Routing — Determines which collections/filters to apply based on jurisdiction.
"""

from app.models.enums import Jurisdiction, QdrantCollection


def get_jurisdiction_context(jurisdiction: Jurisdiction) -> dict:
    """
    Return context information for the selected jurisdiction.
    Used to customize system prompts and search behavior.
    """
    contexts = {
        Jurisdiction.INDIA: {
            "label": "India",
            "legal_system": "Indian statutory framework",
            "collections": [
                QdrantCollection.INDIA_IP_LAW.value,
                QdrantCollection.INDIA_REGULATORY.value,
                QdrantCollection.INDIA_BIODIVERSITY.value,
                QdrantCollection.INDIA_TKDL.value,
                QdrantCollection.CASE_LAW.value,
            ],
            "key_statutes": [
                "Patents Act, 1970 (amended 2024)",
                "Biological Diversity Act, 2002 (amended 2023)",
                "Drugs & Cosmetics Act, 1940",
                "Trade Marks Act, 1999",
                "Geographical Indications of Goods Act, 1999",
            ],
            "prompt_suffix": (
                "Focus on Indian IP law, TKDL, and AYUSH regulatory framework. "
                "Cite specific sections of Indian statutes."
            ),
        },
        Jurisdiction.INTERNATIONAL: {
            "label": "International",
            "legal_system": "International IP and trade framework",
            "collections": [
                QdrantCollection.INTERNATIONAL_IP.value,
                QdrantCollection.INTERNATIONAL_MARKET.value,
                QdrantCollection.CASE_LAW.value,
            ],
            "key_statutes": [
                "TRIPS Agreement",
                "Convention on Biological Diversity (CBD)",
                "Nagoya Protocol",
                "WIPO GRATK Treaty, 2024",
                "Patent Cooperation Treaty (PCT)",
            ],
            "prompt_suffix": (
                "Focus on international IP treaties, market access regulations, "
                "and cross-border IP protection. Cite specific treaty articles."
            ),
        },
        Jurisdiction.BOTH: {
            "label": "India & International",
            "legal_system": "Combined Indian and international framework",
            "collections": [c.value for c in QdrantCollection],
            "key_statutes": [],
            "prompt_suffix": (
                "Provide a comparative view of Indian and international IP frameworks. "
                "Keep the two jurisdictions visibly separate in your answer."
            ),
        },
    }
    return contexts.get(jurisdiction, contexts[Jurisdiction.INDIA])
