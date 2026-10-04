"""
Document Statistical Metrics Calculator.
Calculates character count, word count, sentence count, paragraph count,
page count, average sentence length, average word length, vocabulary richness,
and estimated reading time.
"""
from __future__ import annotations

import re
from typing import Dict, Any
from app.services.nlp.preprocessor import segment_sentences, segment_paragraphs

def compute_document_statistics(text: str, page_count: int = 1) -> Dict[str, Any]:
    """Compute exact, grounded statistical metrics for a given document text."""
    if not text or not text.strip():
        return {
            "character_count": 0,
            "word_count": 0,
            "sentence_count": 0,
            "paragraph_count": 0,
            "page_count": max(1, page_count),
            "avg_sentence_length": 0.0,
            "avg_word_length": 0.0,
            "vocabulary_richness": 0.0,
            "estimated_reading_time_mins": 0.0,
        }

    char_count = len(text)
    # Tokenize words using alphanumeric characters
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    
    # Sentences and paragraphs
    sentences = segment_sentences(text)
    sentence_count = max(1, len(sentences)) if word_count > 0 else 0
    
    paragraphs = segment_paragraphs(text)
    paragraph_count = max(1, len(paragraphs)) if word_count > 0 else 0

    # Averages
    avg_sentence_length = round(word_count / sentence_count, 1) if sentence_count > 0 else 0.0
    total_word_chars = sum(len(w) for w in words)
    avg_word_length = round(total_word_chars / word_count, 1) if word_count > 0 else 0.0

    # Vocabulary richness (Type-Token Ratio TTR)
    unique_words = set(w.lower() for w in words)
    vocabulary_richness = round(len(unique_words) / word_count, 3) if word_count > 0 else 0.0

    # Estimated reading time (standard average reading speed of 200 words per minute)
    estimated_reading_time = round(max(0.5, word_count / 200.0), 1) if word_count > 0 else 0.0

    return {
        "character_count": char_count,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "page_count": max(1, page_count),
        "avg_sentence_length": avg_sentence_length,
        "avg_word_length": avg_word_length,
        "vocabulary_richness": vocabulary_richness,
        "estimated_reading_time_mins": estimated_reading_time,
    }
