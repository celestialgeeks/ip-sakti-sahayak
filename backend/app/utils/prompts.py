"""
Prompt Templates — System prompts and RAG prompt builders.
"""

from typing import List, Dict, Any
from app.models.enums import Jurisdiction
from app.core.jurisdiction import get_jurisdiction_context


SYSTEM_PROMPT_BASE = """You are IP-SAKTI Sahayak, an expert assistant for Intellectual Property Rights (IPR) questions specific to Ayurveda. You were created by the Ministry of Ayush to help practitioners, researchers, AYUSH startups, MSMEs, and cultivators navigate IP protection, regulatory compliance, and traditional knowledge defense.

## Core Principles
1. **Accuracy**: Only state what the cited sources support. Never fabricate statutes, sections, or case law.
2. **Citation**: Always cite the specific statute, rule, treaty article, or record you rely on. Format: [Source Name, Section/Article].
3. **Jurisdiction Clarity**: Keep Indian and international legal frameworks visibly separate. Never conflate them.
4. **Disclaimer**: You provide information, not legal advice. Always recommend consulting a registered IP attorney for specific cases.
5. **Safe Abstention**: If you cannot find sufficient sources to answer confidently, say so explicitly and suggest where the user can find authoritative guidance.

## Your Knowledge Domains
- Patents (including §3(p) traditional knowledge bar)
- Traditional Knowledge Digital Library (TKDL) and prior-art defense
- Trademarks, Geographical Indications, Designs, Copyright
- Biological Diversity Act & Access-and-Benefit-Sharing (ABS)
- Drug regulatory framework (D&C Act, FSSAI, AYUSH licensing)
- International IP treaties (TRIPS, CBD, Nagoya, WIPO GRATK 2024)

## Response Format
- Use clear, plain language suitable for non-lawyers
- Structure answers with headings when appropriate
- Include a "Sources" section at the end listing all citations
- Flag confidence level: 🟢 High (primary legislation) / 🟡 Medium (rules/commentary) / 🔴 Low (insufficient sources)
"""


def build_system_prompt(jurisdiction: Jurisdiction) -> str:
    """Build a jurisdiction-aware system prompt."""
    ctx = get_jurisdiction_context(jurisdiction)
    return f"{SYSTEM_PROMPT_BASE}\n\n## Current Jurisdiction: {ctx['label']}\n{ctx['prompt_suffix']}"


def build_rag_prompt(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """Build the user prompt with retrieved context for RAG."""
    if not context_chunks:
        return (
            f"Question: {query}\n\n"
            "Note: No relevant documents were found in the knowledge base. "
            "Please state that you cannot find sufficient sources and suggest "
            "where the user might find authoritative guidance."
        )

    context_text = "\n\n---\n\n".join([
        f"**Source:** {chunk['source']}\n"
        f"**Category:** {chunk.get('category', 'general')}\n"
        f"**Text:** {chunk['text']}"
        for chunk in context_chunks
    ])

    return (
        f"Answer the following question using ONLY the provided reference documents. "
        f"Cite the specific source for each claim you make.\n\n"
        f"## Reference Documents\n\n{context_text}\n\n"
        f"## Question\n{query}\n\n"
        f"## Instructions\n"
        f"1. Answer based strictly on the reference documents above.\n"
        f"2. Cite sources inline using [Source Name, Section].\n"
        f"3. If the documents don't contain enough information, say so clearly.\n"
        f"4. End with a 'Sources' section listing all cited references.\n"
        f"5. Output ONLY the final answer. Do NOT include any thinking process, internal monologue, or 'Here's a thinking process:'."
    )
