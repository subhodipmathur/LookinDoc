"""
NLP Intelligence API Endpoints:
- GET  /api/documents/{id}/analysis  → complete document NLP analysis
- GET  /api/documents/{id}/keywords  → TF-IDF keywords
- GET  /api/documents/{id}/entities  → spaCy categorized named entities
- GET  /api/documents/{id}/summary   → Extractive summary (short / medium / detailed)
- POST /api/documents/{id}/search    → TF-IDF + Cosine passage search
- POST /api/documents/{id}/question  → Retrieval-based Question Answering
"""
from __future__ import annotations

import logging
from uuid import UUID
from typing import List, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.repositories import document_repository as repo
from app.schemas.document import (
    DocumentAnalysisResponse,
    DocumentStatisticsResponse,
    KeywordItem,
    EntityItem,
    ExtractiveSummaryResponse,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    QuestionRequest,
    QuestionResponse,
)
from app.services.nlp.keywords import extract_tfidf_keywords
from app.services.nlp.ner import extract_named_entities, aggregate_entities_by_category
from app.services.nlp.pipeline import process_document_nlp_pipeline
from app.services.nlp.qa import answer_question_from_document
from app.services.nlp.search import search_document_chunks
from app.services.nlp.statistics import compute_document_statistics
from app.services.nlp.summarizer import generate_extractive_summary
from app.services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["NLP Intelligence"])

def _db(client: Client = Depends(get_supabase_client)) -> Client:
    return client


def _get_document_text_or_404(client: Client, document_id: str) -> str:
    """Helper to fetch raw extracted text or raise 404."""
    raw_text = repo.get_document_raw_text(client, document_id)
    if not raw_text:
        doc = repo.get_document(client, document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found."
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document has no extracted text to analyze."
        )
    return raw_text


# ---------------------------------------------------------------------------
# 1. Full Document Analysis (GET /api/documents/{id}/analysis)
# ---------------------------------------------------------------------------

@router.get("/{document_id}/analysis", response_model=DocumentAnalysisResponse)
def get_document_analysis(
    document_id: UUID,
    client: Client = Depends(_db)
) -> DocumentAnalysisResponse:
    """
    Retrieve or compute complete NLP analysis:
    - Statistics metrics
    - TF-IDF keywords
    - Categorized Named Entities (spaCy)
    - Extractive Summary
    """
    doc_id = str(document_id)
    raw_text = _get_document_text_or_404(client, doc_id)
    doc_meta = repo.get_document(client, doc_id) or {}
    page_count = doc_meta.get("page_count", 1) or 1

    # Check cached keywords from database
    keywords = repo.get_document_keywords(client, doc_id)
    if not keywords:
        # Run pipeline if not yet populated
        result = process_document_nlp_pipeline(client, doc_id, raw_text, page_count)
        return DocumentAnalysisResponse(
            document_id=doc_id,
            statistics=DocumentStatisticsResponse(**result["statistics"]),
            keywords=[KeywordItem(**kw) for kw in result["keywords"]],
            entities={
                cat: [EntityItem(**item) for item in items]
                for cat, items in result["entities"].items()
            },
            summary=ExtractiveSummaryResponse(**result["summary"])
        )

    # If already in DB, compute / assemble aggregated view
    stats = compute_document_statistics(raw_text, page_count=page_count)
    raw_entities = repo.get_document_entities(client, doc_id)
    if not raw_entities:
        raw_entities = extract_named_entities(raw_text)
        repo.save_document_entities(client, doc_id, raw_entities)
    
    grouped_entities = aggregate_entities_by_category(raw_entities)
    summary_data = generate_extractive_summary(raw_text, length_mode="medium")

    return DocumentAnalysisResponse(
        document_id=doc_id,
        statistics=DocumentStatisticsResponse(**stats),
        keywords=[KeywordItem(**kw) for kw in keywords],
        entities={
            cat: [EntityItem(**item) for item in items]
            for cat, items in grouped_entities.items()
        },
        summary=ExtractiveSummaryResponse(**summary_data)
    )


# ---------------------------------------------------------------------------
# 2. TF-IDF Keywords (GET /api/documents/{id}/keywords)
# ---------------------------------------------------------------------------

@router.get("/{document_id}/keywords", response_model=List[KeywordItem])
def get_keywords(
    document_id: UUID,
    client: Client = Depends(_db)
) -> List[KeywordItem]:
    """Retrieve ranked TF-IDF keywords with term importance scores."""
    doc_id = str(document_id)
    keywords = repo.get_document_keywords(client, doc_id)
    if not keywords:
        raw_text = _get_document_text_or_404(client, doc_id)
        keywords = extract_tfidf_keywords(raw_text, top_n=20)
        repo.save_document_keywords(client, doc_id, keywords)

    return [KeywordItem(**kw) for kw in keywords]


# ---------------------------------------------------------------------------
# 3. Named Entities (GET /api/documents/{id}/entities)
# ---------------------------------------------------------------------------

@router.get("/{document_id}/entities", response_model=Dict[str, List[EntityItem]])
def get_entities(
    document_id: UUID,
    client: Client = Depends(_db)
) -> Dict[str, List[EntityItem]]:
    """Retrieve categorized Named Entities (People, Orgs, Locations, Dates, Events)."""
    doc_id = str(document_id)
    raw_entities = repo.get_document_entities(client, doc_id)
    if not raw_entities:
        raw_text = _get_document_text_or_404(client, doc_id)
        raw_entities = extract_named_entities(raw_text)
        repo.save_document_entities(client, doc_id, raw_entities)

    grouped = aggregate_entities_by_category(raw_entities)
    return {
        cat: [EntityItem(**item) for item in items]
        for cat, items in grouped.items()
    }


# ---------------------------------------------------------------------------
# 4. Extractive Summary (GET /api/documents/{id}/summary)
# ---------------------------------------------------------------------------

@router.get("/{document_id}/summary", response_model=ExtractiveSummaryResponse)
def get_summary(
    document_id: UUID,
    length_mode: str = Query("medium", pattern="^(short|medium|detailed)$"),
    client: Client = Depends(_db)
) -> ExtractiveSummaryResponse:
    """Generate extractive summary with custom length mode (short, medium, detailed)."""
    doc_id = str(document_id)
    raw_text = _get_document_text_or_404(client, doc_id)
    summary_data = generate_extractive_summary(raw_text, length_mode=length_mode)
    return ExtractiveSummaryResponse(**summary_data)


# ---------------------------------------------------------------------------
# 5. Document Passage Search (POST /api/documents/{id}/search)
# ---------------------------------------------------------------------------

@router.post("/{document_id}/search", response_model=SearchResponse)
def search_document(
    document_id: UUID,
    body: SearchRequest,
    client: Client = Depends(_db)
) -> SearchResponse:
    """
    Search document passages using TF-IDF + Cosine Similarity over indexed chunks.
    """
    doc_id = str(document_id)
    chunks = repo.get_document_chunks(client, doc_id)
    if not chunks:
        raw_text = _get_document_text_or_404(client, doc_id)
        from app.services.nlp.preprocessor import create_document_chunks
        chunks_objs = create_document_chunks(raw_text)
        repo.save_document_chunks(client, doc_id, chunks_objs)
        chunks = repo.get_document_chunks(client, doc_id)

    results = search_document_chunks(
        query=body.query,
        chunks=chunks,
        top_k=body.top_k or 5
    )

    items = [SearchResultItem(**r) for r in results]
    return SearchResponse(
        query=body.query,
        results=items,
        total_results=len(items)
    )


# ---------------------------------------------------------------------------
# 6. Question Answering (POST /api/documents/{id}/question)
# ---------------------------------------------------------------------------

@router.post("/{document_id}/question", response_model=QuestionResponse)
def ask_question(
    document_id: UUID,
    body: QuestionRequest,
    client: Client = Depends(_db)
) -> QuestionResponse:
    """
    Answer questions using transparent retrieval NLP methods over document chunks.
    """
    doc_id = str(document_id)
    raw_text = _get_document_text_or_404(client, doc_id)
    chunks = repo.get_document_chunks(client, doc_id)

    qa_res = answer_question_from_document(
        question=body.question,
        extracted_text=raw_text,
        chunks=chunks
    )

    return QuestionResponse(**qa_res)
