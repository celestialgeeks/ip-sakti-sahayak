"""
Text Processing Utilities — Document chunking, cleaning, and metadata extraction.
"""

from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re
import uuid


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    metadata: Dict[str, Any] = {},
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
