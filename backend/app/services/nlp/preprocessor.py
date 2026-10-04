"""
NLP Preprocessing, Text Normalization, Sentence Segmentation, and Document Chunking.
Uses spaCy and NLTK for robust linguistic analysis.
"""
from __future__ import annotations

import re
from typing import List, NamedTuple, Tuple
import spacy
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Lazy loading of spaCy model
_nlp_spacy = None

def get_spacy_model():
    """Get or initialize the spaCy English model singleton."""
    global _nlp_spacy
    if _nlp_spacy is None:
        try:
            _nlp_spacy = spacy.load("en_core_web_sm")
        except Exception:
            # Fallback if package name differs or not installed
            _nlp_spacy = spacy.blank("en")
            _nlp_spacy.add_pipe("sentencizer")
    return _nlp_spacy


class DocumentChunk(NamedTuple):
    chunk_index: int
    text: str
    start_position: int
    end_position: int


def normalize_text(text: str) -> str:
    """Clean and normalize raw text: collapse excessive whitespace and normalize line endings."""
    if not text:
        return ""
    # Normalize carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace multiple spaces with single space, preserve paragraph breaks
    paragraphs = [re.sub(r"[ \t]+", " ", p).strip() for p in text.split("\n\n")]
    return "\n\n".join(p for p in paragraphs if p)


def segment_sentences(text: str) -> List[Tuple[str, int, int]]:
    """
    Split text into sentences with start and end character offsets using spaCy.
    Returns list of (sentence_text, start_char, end_char).
    """
    if not text:
        return []
    nlp = get_spacy_model()
    # Process text with max length safety
    doc = nlp(text[:1000000])  # support up to 1M chars
    sentences = []
    for sent in doc.sents:
        sent_str = sent.text.strip()
        if sent_str:
            sentences.append((sent_str, sent.start_char, sent.end_char))
    return sentences


def segment_paragraphs(text: str) -> List[str]:
    """Split text into paragraphs based on double newlines or indentations."""
    if not text:
        return []
    raw_paras = text.split("\n\n")
    paras = [p.strip() for p in raw_paras if p.strip()]
    if not paras:
        paras = [p.strip() for p in text.split("\n") if p.strip()]
    return paras or [text]


def create_document_chunks(
    text: str,
    sentences_per_chunk: int = 3,
    sentence_overlap: int = 1
) -> List[DocumentChunk]:
    """
    Create logical document chunks with sentence-level boundaries and overlap.
    Each chunk contains start_position and end_position character offsets.
    """
    sentences = segment_sentences(text)
    if not sentences:
        return [DocumentChunk(chunk_index=0, text=text, start_position=0, end_position=len(text))]

    chunks = []
    chunk_idx = 0
    i = 0
    total_sents = len(sentences)

    step = max(1, sentences_per_chunk - sentence_overlap)

    while i < total_sents:
        chunk_sents = sentences[i : i + sentences_per_chunk]
        chunk_text = " ".join(s[0] for s in chunk_sents).strip()
        start_char = chunk_sents[0][1]
        end_char = chunk_sents[-1][2]

        if chunk_text:
            chunks.append(
                DocumentChunk(
                    chunk_index=chunk_idx,
                    text=chunk_text,
                    start_position=start_char,
                    end_position=end_char
                )
            )
            chunk_idx += 1

        i += step

    return chunks
