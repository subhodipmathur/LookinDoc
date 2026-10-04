"""
TF-IDF Keyword Extraction.
Extracts top weighted unigrams and bigrams using scikit-learn TfidfVectorizer.
Ranks terms by importance and filters out low-value terms.
"""
from __future__ import annotations

import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from app.services.nlp.preprocessor import segment_sentences

def extract_tfidf_keywords(
    text: str,
    top_n: int = 15,
    min_score_threshold: float = 0.05
) -> List[Dict[str, Any]]:
    """
    Extract top keywords using TF-IDF across document sentences/paragraphs.
    Returns ranked list of dictionaries with keyword, score, and rank.
    """
    if not text or not text.strip():
        return []

    # Use sentences as pseudo-documents to compute meaningful inverse document frequencies (IDF)
    sentences = [s[0] for s in segment_sentences(text)]
    if len(sentences) < 2:
        # Fallback to paragraph or line splits if text is single sentence
        sentences = [p for p in text.split("\n") if p.strip()]
        if len(sentences) < 2:
            sentences = [text]

    # Configure TF-IDF vectorizer with English stop words, unigrams and bigrams
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=200,
        token_pattern=r"(?u)\b[a-zA-Z]{3,}\b"  # letters only, minimum 3 chars
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(sentences)
        feature_names = vectorizer.get_feature_names_out()
        
        # Calculate mean or max TF-IDF score across sentences
        scores = tfidf_matrix.max(axis=0).toarray().flatten()
        
        # Pair features with scores
        term_scores = []
        for term, score in zip(feature_names, scores):
            if score >= min_score_threshold:
                # Capitalize words appropriately for presentation
                clean_term = " ".join(word.capitalize() for word in term.split())
                term_scores.append((clean_term, round(float(score), 3)))

        # Sort descending by score
        term_scores.sort(key=lambda x: x[1], reverse=True)

        # Deduplicate overlapping sub-terms if higher rank already present
        results = []
        seen = set()
        rank = 1
        for term, score in term_scores:
            term_lower = term.lower()
            if term_lower not in seen:
                seen.add(term_lower)
                results.append({
                    "keyword": term,
                    "score": score,
                    "rank": rank
                })
                rank += 1
                if len(results) >= top_n:
                    break

        return results
    except Exception as e:
        # If vocabulary is empty (e.g. only stop words or numbers)
        return []
