"""
Pydantic schemas for document request/response contracts.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class DocumentListItem(BaseModel):
    """Lightweight document representation for the library view."""
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
    """Full document representation for the workspace view."""
    storage_path: Optional[str] = None
    sentence_count: Optional[int] = None
    character_count: Optional[int] = None
    # extracted_text intentionally omitted from default JSON response for size efficiency


class DocumentDetailWithText(DocumentDetail):
    """Document representation including raw extracted text when explicitly requested."""
    extracted_text: Optional[str] = None


class DocumentListResponse(BaseModel):
    documents: list[DocumentListItem]
    total: int


class DocumentDetailResponse(BaseModel):
    document: DocumentDetail


class DeleteResponse(BaseModel):
    success: bool
    message: str


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
