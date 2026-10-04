"""
Pydantic schemas for document request/response contracts and NLP endpoints.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Core Document Models
# ---------------------------------------------------------------------------

class DocumentListItem(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    processing_status: str
    word_count: Optional[int] = None
    page_count: Optional[int] = None
    created_at: str
    updated_at: str


class DocumentDetail(DocumentListItem):
    storage_path: Optional[str] = None
    sentence_count: Optional[int] = None
    character_count: Optional[int] = None


class DocumentListResponse(BaseModel):
    documents: List[DocumentListItem]
    total: int


class DocumentDetailResponse(BaseModel):
    document: DocumentDetail


class DeleteResponse(BaseModel):
    success: bool
    message: str


# ---------------------------------------------------------------------------
# NLP Intelligence & Analysis Schemas
# ---------------------------------------------------------------------------

class KeywordItem(BaseModel):
    keyword: str
    score: float
    rank: int


class EntityItem(BaseModel):
    entity_text: str
    entity_label: str
    category: Optional[str] = None
    frequency: Optional[int] = 1
    start_position: Optional[int] = None
    end_position: Optional[int] = None


class ExtractiveSummaryResponse(BaseModel):
    summary_text: str
    sentence_count: int
    original_sentence_count: int
    compression_ratio: float
    selected_sentences: List[str] = []


class DocumentStatisticsResponse(BaseModel):
    character_count: int
    word_count: int
    sentence_count: int
    paragraph_count: int
    page_count: int
    avg_sentence_length: float
    avg_word_length: float
    vocabulary_richness: float
    estimated_reading_time_mins: float


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    statistics: DocumentStatisticsResponse
    keywords: List[KeywordItem]
    entities: Dict[str, List[EntityItem]]
    summary: ExtractiveSummaryResponse


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="Natural language search query")
    top_k: Optional[int] = Field(default=5, ge=1, le=20)


class SearchResultItem(BaseModel):
    chunk_index: int
    text: str
    relevance_score: float
    start_position: Optional[int] = None
    end_position: Optional[int] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    total_results: int


class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500, description="Question to answer from document text")


class QuestionResponse(BaseModel):
    question: str
    answer: str
    supporting_passage: str
    relevance_score: float


# ---------------------------------------------------------------------------
# Internal create/update models
# ---------------------------------------------------------------------------

class DocumentCreate(BaseModel):
    id: Optional[str] = None
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    storage_path: Optional[str] = None
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    sentence_count: Optional[int] = None
    character_count: Optional[int] = None
    processing_status: str = "pending"


class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    processing_status: Optional[str] = None
    storage_path: Optional[str] = None
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    sentence_count: Optional[int] = None
    character_count: Optional[int] = None
