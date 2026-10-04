"""
Retrieval-Based Question Answering Engine (No external LLM required).
Matches user questions against document chunks/sentences via TF-IDF + Cosine Similarity.
Extracts the direct answering sentences and provides the verbatim supporting evidence passage.
"""
from __future__ import annotations

import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.nlp.preprocessor import segment_sentences

def answer_question_from_document(
    question: str,
    extracted_text: str,
    chunks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Answer questions using transparent retrieval NLP methods:
    1. Compares question vector with chunk vectors using Cosine Similarity.
    2. Identifies top supporting evidence chunk.
    3. Analyzes individual sentences inside the chunk to extract the core direct answer.
    4. Returns question, answer, supporting passage, and relevance score.
    """
    if not question or not question.strip():
        return {
            "question": "",
            "answer": "Please provide a valid question to search the document.",
            "supporting_passage": "",
            "relevance_score": 0.0
        }

    if not extracted_text or not extracted_text.strip():
        return {
            "question": question,
            "answer": "No document text available to answer this question.",
            "supporting_passage": "",
            "relevance_score": 0.0
        }

    # If chunks are provided, use chunks, otherwise segment text into sentences
    if not chunks:
        sentences_list = segment_sentences(extracted_text)
        candidates = [s[0] for s in sentences_list]
    else:
        candidates = [c.get("text", "") for c in chunks]

    if not candidates:
        return {
            "question": question,
            "answer": "Unable to find relevant information in the document.",
            "supporting_passage": "",
            "relevance_score": 0.0
        }

    # Fit TF-IDF on all candidates + query
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1
    )

    try:
        tfidf_candidates = vectorizer.fit_transform(candidates)
        tfidf_query = vectorizer.transform([question.strip()])

        similarities = cosine_similarity(tfidf_query, tfidf_candidates).flatten()
        best_idx = int(similarities.argmax())
        best_score = float(similarities[best_idx])

        if best_score < 0.05:
            return {
                "question": question,
                "answer": "The document does not appear to contain relevant information to answer this question.",
                "supporting_passage": "",
                "relevance_score": round(best_score, 3)
            }

        supporting_passage = candidates[best_idx]

        # Extract best sentence from supporting passage
        passage_sentences = [s[0] for s in segment_sentences(supporting_passage)]
        if len(passage_sentences) > 1:
            try:
                tfidf_sent = vectorizer.transform(passage_sentences)
                sent_sims = cosine_similarity(tfidf_query, tfidf_sent).flatten()
                best_sent_idx = int(sent_sims.argmax())
                direct_answer = passage_sentences[best_sent_idx]
            except Exception:
                direct_answer = passage_sentences[0]
        else:
            direct_answer = supporting_passage

        return {
            "question": question,
            "answer": direct_answer,
            "supporting_passage": supporting_passage,
            "relevance_score": round(best_score, 3)
        }
    except Exception as e:
        # Fallback keyword match
        clean_q = question.lower()
        for cand in candidates:
            if any(w in cand.lower() for w in clean_q.split() if len(w) > 3):
                return {
                    "question": question,
                    "answer": cand,
                    "supporting_passage": cand,
                    "relevance_score": 0.4
                }
        return {
            "question": question,
            "answer": "Could not compute an answer for this question.",
            "supporting_passage": "",
            "relevance_score": 0.0
        }
