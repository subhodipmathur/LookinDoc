"""
Master NLP Pipeline Coordinator.
Orchestrates text normalization, chunking, TF-IDF keyword extraction,
spaCy Named Entity Recognition, extractive summarization, and database persistence.
"""
from __future__ import annotations

import logging
from typing import Dict, Any
from supabase import Client

from app.repositories import document_repository as repo
from app.schemas.document import DocumentUpdate
from app.services.nlp.preprocessor import normalize_text, create_document_chunks
from app.services.nlp.statistics import compute_document_statistics
from app.services.nlp.keywords import extract_tfidf_keywords
from app.services.nlp.ner import extract_named_entities, aggregate_entities_by_category
from app.services.nlp.summarizer import generate_extractive_summary

logger = logging.getLogger(__name__)

def process_document_nlp_pipeline(
    client: Client,
    document_id: str,
    raw_text: str,
    page_count: int = 1
) -> Dict[str, Any]:
    """
    Execute the complete end-to-end NLP intelligence pipeline on document text:
    1. Normalize text.
    2. Compute exact statistical metrics.
    3. Generate document chunks and store in Supabase chunks table.
    4. Extract TF-IDF keywords and store in Supabase keywords table.
    5. Extract spaCy named entities and store in Supabase entities table.
    6. Generate extractive summary and store in Supabase summaries table.
    7. Update document record status to 'ready'.
    """
    logger.info("Starting NLP pipeline for document: %s", document_id)
    
    # 1. Normalize
    normalized = normalize_text(raw_text)

    # 2. Statistics
    stats = compute_document_statistics(normalized, page_count=page_count)

    # 3. Chunks
    chunks = create_document_chunks(normalized, sentences_per_chunk=3, sentence_overlap=1)
    try:
        repo.save_document_chunks(client, document_id, chunks)
        logger.info("Saved %d chunks for document %s", len(chunks), document_id)
    except Exception as e:
        logger.warning("Could not persist chunks for %s: %s", document_id, e)

    # 4. TF-IDF Keywords
    keywords = extract_tfidf_keywords(normalized, top_n=20)
    try:
        repo.save_document_keywords(client, document_id, keywords)
        logger.info("Saved %d keywords for document %s", len(keywords), document_id)
    except Exception as e:
        logger.warning("Could not persist keywords for %s: %s", document_id, e)

    # 5. Named Entity Recognition (spaCy)
    entities = extract_named_entities(normalized)
    try:
        repo.save_document_entities(client, document_id, entities)
        logger.info("Saved %d entities for document %s", len(entities), document_id)
    except Exception as e:
        logger.warning("Could not persist entities for %s: %s", document_id, e)

    # 6. Extractive Summary
    summary_data = generate_extractive_summary(normalized, length_mode="medium")
    try:
        repo.save_document_summary(
            client,
            document_id=document_id,
            summary_text=summary_data["summary_text"],
            sentence_count=summary_data["sentence_count"]
        )
        logger.info("Saved extractive summary for document %s", document_id)
    except Exception as e:
        logger.warning("Could not persist summary for %s: %s", document_id, e)

    # 7. Update document record with statistics and ready status
    try:
        repo.update_document(
            client,
            document_id,
            DocumentUpdate(
                processing_status="ready",
                page_count=stats["page_count"],
                word_count=stats["word_count"],
                sentence_count=stats["sentence_count"],
                character_count=stats["character_count"]
            )
        )
    except Exception as e:
        logger.error("Failed to update document stats: %s", e)

    return {
        "document_id": document_id,
        "statistics": stats,
        "keywords": keywords,
        "entities": aggregate_entities_by_category(entities),
        "summary": summary_data,
        "chunks_count": len(chunks)
    }
