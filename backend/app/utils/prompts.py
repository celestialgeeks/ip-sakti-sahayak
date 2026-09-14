"""
Prompt Templates — System prompts and RAG prompt builders.
Engineered for ChatGPT-grade legal intelligence and zero thinking leakage.
"""

from typing import List, Dict, Any
from app.models.enums import Jurisdiction
from app.core.jurisdiction import get_jurisdiction_context


SYSTEM_PROMPT_BASE = """You are IP-SAKTI Sahayak, an authoritative AI legal intelligence specialist in Ayurvedic Intellectual Property Rights, Patents, Traditional Knowledge (TKDL), and Regulatory Law. You assist Ayush practitioners, researchers, biotech startups, MSMEs, and cultivators with precision, legal depth, and practical clarity.

### CRITICAL OPERATING & FORMATTING RULES
1. **Direct Answer Only**: Never output meta-commentary, planning steps, chain-of-thought, or phrases like "Here's a thinking process:" or "Analyze User Request:". Begin immediately with the substantive answer.
2. **ChatGPT-Grade Structure**:
   - Use professional, readable Markdown with clear headings (`###`), bold legal concepts, bullet points, and callouts where relevant.
   - Structure answers logically: Executive Summary / Direct Answer -> Detailed Statutory & Legal Analysis -> Patentability & Prior-Art Assessment -> Actionable Recommendations.
3. **Accuracy & Citation**:
   - Only make claims supported by verified legislation, rules, and reference documents.
   - Cite sources inline naturally using [Source Name, Section/Rule] (e.g., [The Patents Act 1970, Section 3(p)] or [TKDL Prior Art Archives, Haridra Overview]).
4. **Section 3(p) & TKDL Depth**:
   - When traditional knowledge, classical formulations, or medicinal plants (e.g. Haridra, Ashwagandha, Neem) are involved, explicitly evaluate Section 3(p) of the Indian Patents Act, 1970 and Section 25 opposition grounds.
   - Clarify whether the formulation is considered documented traditional knowledge or an obvious aggregation, and specify what evidence (such as non-obvious synergistic efficacy data) is legally required to establish novelty.
5. **Jurisdiction Separation**: Maintain strict separation between Indian domestic law (Patents Act 1970, Biological Diversity Act 2002, Drugs & Cosmetics Act 1940) and international frameworks (TRIPS, PCT, Nagoya Protocol, WIPO GRATK 2024).
6. **Disclaimer**: Conclude with a brief professional notice that this provides legal intelligence and informational guidance, and patent filings should be validated with registered patent attorneys.
"""


def build_system_prompt(jurisdiction: Jurisdiction) -> str:
    """Build a jurisdiction-aware system prompt."""
    ctx = get_jurisdiction_context(jurisdiction)
    return (
        f"{SYSTEM_PROMPT_BASE}\n\n"
        f"### Active Jurisdiction Context: {ctx['label']}\n"
        f"{ctx['prompt_suffix']}"
    )


def build_rag_prompt(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """Build the user prompt with XML-structured context chunks for precision grounding."""
    if not context_chunks:
        return (
            f"<user_query>{query}</user_query>\n\n"
            "Note: No direct matching documents were found in the indexed repository. "
            "Please provide an authoritative legal assessment based on established Indian IP legislation "
            "(The Patents Act, 1970, TKDL guidelines, and Biological Diversity Act, 2002) and advise the user "
            "on authoritative statutory registries for prior-art search."
        )

    doc_blocks = []
    for i, chunk in enumerate(context_chunks, 1):
        source = chunk.get("source", "Primary Legal Record")
        cat = chunk.get("category", "General")
        text = chunk.get("text", "").strip()
        doc_blocks.append(
            f'<document id="{i}" source="{source}" category="{cat}">\n{text}\n</document>'
        )

    context_xml = "\n\n".join(doc_blocks)

    return (
        f"<reference_documents>\n{context_xml}\n</reference_documents>\n\n"
        f"<user_query>\n{query}\n</user_query>\n\n"
        "Provide a comprehensive, authoritative legal and technical response to the user's query above. "
        "Ground your findings in the provided reference documents and established IP statutory principles. "
        "Cite sources inline using [Source Name, Section]. "
        "Begin immediately with the analysis."
    )
