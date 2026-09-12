"""
Input Validators — Sanitize and validate user inputs.
"""

import re
from typing import Optional


def sanitize_query(query: str) -> str:
    """Sanitize user query input."""
    # Strip HTML tags
    query = re.sub(r"<[^>]+>", "", query)
    # Remove potential injection patterns
    query = query.replace("```", "")
    # Normalize whitespace
    query = re.sub(r"\s+", " ", query).strip()
    return query


def is_in_scope(query: str) -> bool:
    """
    Check if a query is within the Ayurveda IP scope.
    Returns False for clearly off-topic queries.
    """
    # Keywords that indicate Ayurveda/IP relevance
    relevant_keywords = [
        "ayurveda", "ayurvedic", "patent", "trademark", "ip", "intellectual property",
        "tkdl", "traditional knowledge", "formulation", "herbal", "biodiversity",
        "abs", "benefit sharing", "geographical indication", "gi", "copyright",
        "design", "plant variety", "trade secret", "drug", "cosmetic",
        "fssai", "ayush", "classical", "proprietary", "phytopharmaceutical",
        "nagoya", "trips", "wipo", "cbd", "pharmacopoeia", "prior art",
        "section 3", "§3", "ashwagandha", "turmeric", "curcumin", "neem",
    ]

    query_lower = query.lower()
    return any(kw in query_lower for kw in relevant_keywords)


def redact_pii(text: str) -> str:
    """Redact potential PII from text for audit logging."""
    # Email addresses
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "[EMAIL_REDACTED]", text)
    # Phone numbers (Indian format)
    text = re.sub(r"\b[6-9]\d{9}\b", "[PHONE_REDACTED]", text)
    # Aadhaar-like numbers
    text = re.sub(r"\b\d{4}\s?\d{4}\s?\d{4}\b", "[AADHAAR_REDACTED]", text)
    return text
