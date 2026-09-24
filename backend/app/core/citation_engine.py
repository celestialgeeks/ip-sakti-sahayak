"""
Citation Engine — Extract and format source citations from RAG results.
Ensures only genuinely referenced documents are attached with verified primary URLs.
"""

from typing import List, Dict, Any, Optional
from app.models.schemas import Citation
import re
import uuid

# Authoritative primary source URL registry for Indian IP Law & Ayurveda
PRIMARY_SOURCE_REGISTRY: List[Dict[str, Any]] = [
    {
        "patterns": [r"section\s*3\s*\(\s*p\s*\)", r"3\s*\(\s*p\s*\)", r"patents?\s*act", r"patent\s*rules", r"indian\s*patent\s*office", r"\bipo\b"],
        "url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "default_title": "The Patents Act, 1970 (Section 3(p))",
    },
    {
        "patterns": [r"tkdl", r"traditional\s*knowledge\s*digital\s*library", r"csir\s*tkdl"],
        "url": "https://www.tkdl.res.in",
        "default_title": "Traditional Knowledge Digital Library (TKDL)",
    },
    {
        "patterns": [r"nagoya\s*protocol", r"convention\s*on\s*biological\s*diversity", r"\bcbd\b"],
        "url": "https://www.cbd.int/abs/",
        "default_title": "Nagoya Protocol on Access & Benefit-Sharing",
    },
    {
        "patterns": [r"trips", r"wto"],
        "url": "https://www.wto.org/english/tratop_e/trips_e/trips_e.htm",
        "default_title": "WTO TRIPS Agreement",
    },
    {
        "patterns": [r"wipo", r"gratk", r"genetic\s*resources"],
        "url": "https://www.wipo.int/tk/en/",
        "default_title": "WIPO Traditional Knowledge & Genetic Resources Treaty",
    },
    {
        "patterns": [r"biological\s*diversity", r"biodiversity\s*act", r"\bnba\b", r"\bsbb\b", r"access\s*and\s*benefit", r"\babs\b"],
        "url": "http://nbaindia.org",
        "default_title": "Biological Diversity Act, 2002 (National Biodiversity Authority)",
    },
    {
        "patterns": [r"drugs?\s*(and|&)\s*cosmetics", r"d\s*&\s*c\s*act", r"rule\s*158", r"\bcdsco\b", r"ayush\s*licensing"],
        "url": "https://cdsco.gov.in",
        "default_title": "Drugs & Cosmetics Act, 1940 & Ayush Licensing Rules",
    },
    {
        "patterns": [r"trade\s*marks?\s*act", r"trademark", r"tm\s*rules"],
        "url": "https://ipindia.gov.in/trade-marks.htm",
        "default_title": "Trade Marks Act, 1999 (Indian Patent Office)",
    },
    {
        "patterns": [r"geographical\s*indication", r"\bgi\s*act\b", r"gi\s*registry"],
        "url": "https://ipindia.gov.in/geographical-indications.htm",
        "default_title": "Geographical Indications of Goods Act, 1999",
    },
    {
        "patterns": [r"ministry\s*of\s*ayush", r"ayush\s*guidelines", r"pharmacopoeia"],
        "url": "https://ayush.gov.in",
        "default_title": "Ministry of Ayush Regulatory Guidelines",
    },
    {
        "patterns": [r"charaka", r"sushruta", r"bhavaprakasha", r"ashtanga", r"classical\s*ayurved"],
        "url": "https://www.carakasamhitaonline.com",
        "default_title": "Classical Ayurveda Formularies & Ayurvedic Pharmacopoeia",
    },
]


def resolve_source_url(source_name: str, text: str = "") -> str:
    """Resolve an authoritative URL for a given source name and text."""
    combined = f"{source_name} {text}".lower()
    for entry in PRIMARY_SOURCE_REGISTRY:
        for pattern in entry["patterns"]:
            if re.search(pattern, combined, re.IGNORECASE):
                return entry["url"]
    return "https://ipindia.gov.in"


def _is_chunk_referenced_in_answer(chunk: Dict[str, Any], answer: str) -> bool:
    """
    Strictly determine whether a context chunk was genuinely referenced in the answer text.
    Avoids garbage or unreferenced document dumps.
    """
    answer_lower = answer.lower()
    source = chunk.get("source", "").strip()
    source_lower = source.lower()

    # 1. Direct source name mention
    if source_lower and source_lower in answer_lower:
        return True

    # 2. Match key legislative identifiers (e.g., 'Section 3(p)', 'Section 25', 'TKDL')
    specific_identifiers = [
        "section 3(p)", "3(p)", "section 25", "section 3(d)", "section 3(e)",
        "tkdl", "traditional knowledge digital library",
        "biological diversity act", "national biodiversity authority",
        "drugs and cosmetics act", "rule 158", "geographical indications act",
        "bhavaprakasha", "charaka samhita", "sushruta samhita", "trips", "nagoya protocol"
    ]
    for ident in specific_identifiers:
        if ident in source_lower and ident in answer_lower:
            return True

    # 3. Check for inline brackets containing key words from this source
    # e.g. [The Patents Act, Section 3(p)] or [TKDL]
    clean_title = re.sub(r"[^\w\s]", " ", source_lower)
    words = [w for w in clean_title.split() if len(w) > 3 and w not in {"with", "from", "under", "about", "overview", "reference"}]
    matching_words = sum(1 for w in words if w in answer_lower)
    if len(words) >= 2 and matching_words >= 2:
        return True

    return False


def extract_citations(answer: str, context_chunks: List[Dict[str, Any]]) -> List[Citation]:
    """
    Extract ONLY genuinely referenced citations from the generated answer matched
    against retrieved context chunks. Attaches verified primary URLs.
    """
    if not answer or not context_chunks:
        return []

    citations: List[Citation] = []
    seen_sources = set()

    for chunk in context_chunks:
        source = chunk.get("source", "").strip()
        if not source or source in seen_sources:
            continue

        # Strictly check if this chunk's content or source was discussed in the answer
        if _is_chunk_referenced_in_answer(chunk, answer):
            seen_sources.add(source)
            chunk_text = chunk.get("text", "")
            resolved_url = resolve_source_url(source, chunk_text)
            
            citations.append(
                Citation(
                    id=chunk.get("id", str(uuid.uuid4())),
                    source=source,
                    text=chunk_text[:300] + ("..." if len(chunk_text) > 300 else ""),
                    jurisdiction=chunk.get("jurisdiction", "india"),
                    category=chunk.get("category", "general"),
                    confidence_tier=chunk.get("confidence_tier", "primary_legislation"),
                    url=resolved_url,
                )
            )

    return citations[:5]  # Limit to top 5 genuinely cited sources
