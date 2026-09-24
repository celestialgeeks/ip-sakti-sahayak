"""
Text Processing Utilities — Document chunking, cleaning, and metadata extraction.
"""

from typing import List, Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re
import uuid


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Split text into chunks with metadata.
    
    Args:
        text: Full document text
        chunk_size: Target chunk size in characters
        chunk_overlap: Overlap between chunks
        metadata: Base metadata to attach to each chunk
    
    Returns:
        List of chunk dicts with 'id', 'text', and metadata fields.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)

    return [
        {
            "id": str(uuid.uuid4()),
            "text": clean_text(chunk),
            **metadata,
        }
        for chunk in chunks
        if len(chunk.strip()) > 20  # Skip tiny chunks
    ]


def clean_text(text: str) -> str:
    """Clean and normalize text for embedding."""
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove special Unicode characters
    text = text.replace("\u200b", "").replace("\ufeff", "")
    # Strip leading/trailing whitespace
    text = text.strip()
    return text


def extract_section_references(text: str) -> List[str]:
    """
    Extract statutory section references from text.
    E.g., "Section 3(p)", "Rule 158-B", "Article 27"
    """
    patterns = [
        r"[Ss]ection\s+\d+[\(\)\w\-]*",
        r"[Rr]ule\s+\d+[\(\)\w\-]*",
        r"[Aa]rticle\s+\d+[\(\)\w\-]*",
        r"§\s*\d+[\(\)\w\-]*",
    ]
    refs = []
    for pattern in patterns:
        refs.extend(re.findall(pattern, text))
    return list(set(refs))


_SECTION_SPLIT_RE = re.compile(
    r"(?=^\s*(?:Section|Article|Rule|Chapter|Schedule|\d+\.\d+)\b)",
    re.MULTILINE | re.IGNORECASE,
)


def chunk_text_structure_aware(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Structure-aware splitting for legal/statutory texts.

    First splits on statutory boundaries (Section / Article / Rule / Chapter /
    Schedule headings) so a chunk never straddles two provisions; only sections
    larger than ``chunk_size`` are further split with the recursive splitter.
    Falls back to plain :func:`chunk_text` when no structure is detected.
    """
    metadata = metadata or {}

    sections = [sec.strip() for sec in _SECTION_SPLIT_RE.split(text) if sec and sec.strip()]
    if len(sections) <= 1:
        return chunk_text(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap, metadata=metadata)

    chunks: List[Dict[str, Any]] = []
    for section in sections:
        if len(section) <= chunk_size * 1.3:
            pieces = [section]
        else:
            pieces = chunk_text(
                section, chunk_size=chunk_size, chunk_overlap=chunk_overlap, metadata={}
            )
            pieces = [p["text"] for p in pieces]
        for piece in pieces:
            cleaned = clean_text(piece)
            if len(cleaned) > 20:
                chunks.append({"id": str(uuid.uuid4()), "text": cleaned, **metadata})
    return chunks
