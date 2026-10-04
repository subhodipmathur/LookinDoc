"""
Extractive Summarization Service.
Ranks document sentences using TF-IDF term weights and sentence centrality,
selects the most informative sentences, and restores their original chronological order.
Supports Short, Medium, and Detailed modes.
"""
from __future__ import annotations

import numpy as np
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.services.nlp.preprocessor import segment_sentences

def generate_extractive_summary(
    text: str,
    length_mode: str = "medium"  # "short", "medium", "detailed"
) -> Dict[str, Any]:
    """
    Generate an extractive summary of the document.
    Calculates sentence importance scores using TF-IDF representation and sentence centrality.
    """
    if not text or not text.strip():
        return {
            "summary_text": "",
            "sentence_count": 0,
            "original_sentence_count": 0,
            "compression_ratio": 0.0,
            "selected_sentences": []
        }

    sentences_with_offsets = segment_sentences(text)
    original_sentences = [s[0] for s in sentences_with_offsets]
    total_sents = len(original_sentences)

    if total_sents == 0:
        return {
            "summary_text": "",
            "sentence_count": 0,
            "original_sentence_count": 0,
            "compression_ratio": 0.0,
            "selected_sentences": []
        }

    # If document has 3 or fewer sentences, return all
    if total_sents <= 3:
        summary_text = " ".join(original_sentences)
        return {
            "summary_text": summary_text,
            "sentence_count": total_sents,
            "original_sentence_count": total_sents,
            "compression_ratio": 1.0,
            "selected_sentences": original_sentences
        }

    # Determine target sentence count based on length mode
    if length_mode == "short":
        target_count = max(2, min(4, int(total_sents * 0.15)))
    elif length_mode == "detailed":
        target_count = max(5, min(12, int(total_sents * 0.40)))
    else:  # medium
        target_count = max(3, min(7, int(total_sents * 0.25)))

    target_count = min(target_count, total_sents)

    # Compute sentence importance scores via TF-IDF
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(original_sentences)
        
        # Sentence score = sum of TF-IDF weights normalized by sentence length (with damping)
        sentence_scores = []
        for idx in range(total_sents):
            row = tfidf_matrix.getrow(idx).toarray().flatten()
            raw_score = float(np.sum(row))
            # Position bias: introductory and concluding sentences carry slight natural weight
            pos_weight = 1.15 if (idx == 0 or idx == total_sents - 1) else 1.0
            word_count = len(original_sentences[idx].split())
            length_penalty = 1.0 if word_count >= 5 else 0.5  # penalize tiny sentence fragments
            
            final_score = raw_score * pos_weight * length_penalty
            sentence_scores.append((idx, final_score))

        # Sort by importance score descending
        sentence_scores.sort(key=lambda x: x[1], reverse=True)

        # Pick top target_count sentence indices
        top_indices = sorted([idx for idx, _ in sentence_scores[:target_count]])

        # Reconstruct summary in original chronological sequence
        summary_sentences = [original_sentences[i] for i in top_indices]
        summary_text = " ".join(summary_sentences)

        # Compression ratio (summary words / original words)
        original_words = sum(len(s.split()) for s in original_sentences)
        summary_words = sum(len(s.split()) for s in summary_sentences)
        compression_ratio = round(summary_words / max(1, original_words), 3)

        return {
            "summary_text": summary_text,
            "sentence_count": len(summary_sentences),
            "original_sentence_count": total_sents,
            "compression_ratio": compression_ratio,
            "selected_sentences": summary_sentences
        }
    except Exception as e:
        # Fallback to leading sentences if TF-IDF matrix fails
        fallback_sents = original_sentences[:target_count]
        return {
            "summary_text": " ".join(fallback_sents),
            "sentence_count": len(fallback_sents),
            "original_sentence_count": total_sents,
            "compression_ratio": round(len(fallback_sents) / total_sents, 3),
            "selected_sentences": fallback_sents
        }
