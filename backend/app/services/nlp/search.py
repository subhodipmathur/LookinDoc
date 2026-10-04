"""
Document Passage Search Engine.
Implements TF-IDF + Cosine Similarity search over document chunks.
Returns ranked passages with relevance scores and chunk index location.
"""
from __future__ import annotations

from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def search_document_chunks(
    query: str,
    chunks: List[Dict[str, Any]],
    top_k: int = 5,
    min_score: float = 0.05
) -> List[Dict[str, Any]]:
    """
    Search document chunks matching a user's natural query using TF-IDF + Cosine Similarity.
    """
    if not query or not query.strip() or not chunks:
        return []

    chunk_texts = [c.get("text", "") for c in chunks]
    
    # Fit TF-IDF on all chunks
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1
    )

    try:
        tfidf_chunks = vectorizer.fit_transform(chunk_texts)
        tfidf_query = vectorizer.transform([query.strip()])

        # Compute cosine similarity between query and all chunks
        similarities = cosine_similarity(tfidf_query, tfidf_chunks).flatten()

        results = []
        for idx, score in enumerate(similarities):
            if score >= min_score:
                chunk = chunks[idx]
                results.append({
                    "chunk_index": chunk.get("chunk_index", idx),
                    "text": chunk.get("text", ""),
                    "relevance_score": round(float(score), 3),
                    "start_position": chunk.get("start_position", 0),
                    "end_position": chunk.get("end_position", 0),
                })

        # Sort descending by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:top_k]
    except Exception:
        # Fallback keyword substring search if vectorizer finds no matching vocabulary
        clean_query = query.lower().strip()
        fallback_results = []
        for idx, chunk in enumerate(chunks):
            text = chunk.get("text", "")
            if clean_query in text.lower():
                fallback_results.append({
                    "chunk_index": chunk.get("chunk_index", idx),
                    "text": text,
                    "relevance_score": 0.5,
                    "start_position": chunk.get("start_position", 0),
                    "end_position": chunk.get("end_position", 0),
                })
        return fallback_results[:top_k]
