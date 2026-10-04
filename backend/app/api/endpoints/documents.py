"""
Document API endpoints.

Phase 4 & NLP pipeline surface:
  POST /api/documents/upload       → upload file, extract text, upload to Supabase storage, save to DB, run NLP pipeline
  GET  /api/documents              → list all documents
  GET  /api/documents/{id}         → single document detail
  DELETE /api/documents/{id}       → delete document + storage + children
"""
from __future__ import annotations

import logging
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from supabase import Client

from app.core.utils import sanitize_filename
from app.repositories import document_repository as repo
from app.schemas.document import (
    DocumentCreate,
    DocumentDetail,
    DocumentDetailResponse,
    DocumentListItem,
    DocumentListResponse,
    DeleteResponse,
)
from app.services.extractor import extract_document, DocumentExtractionError
from app.services.nlp.pipeline import process_document_nlp_pipeline
from app.services.storage_service import upload_document_file
from app.services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_FILE_SIZE_BYTES = 40 * 1024 * 1024  # 40 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".text"}


# ---------------------------------------------------------------------------
# Dependency — inject Supabase client
# ---------------------------------------------------------------------------

def _db(client: Client = Depends(get_supabase_client)) -> Client:
    return client


# ---------------------------------------------------------------------------
# Upload document (POST /api/documents/upload)
# ---------------------------------------------------------------------------

@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    client: Client = Depends(_db),
) -> DocumentDetailResponse:
    """
    Upload a document (PDF, DOCX, TXT):
    1. Validates file size and format.
    2. Extracts clean text and metadata (page count, words, sentences, characters).
    3. Uploads original file to Supabase Storage.
    4. Saves document record into Supabase PostgreSQL.
    5. Runs end-to-end NLP pipeline (chunks, TF-IDF keywords, spaCy NER, extractive summary).
    6. Returns created document details.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload.",
        )

    # Check file extension
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type ({ext}). Only PDF, DOCX, and TXT files are supported.",
        )

    # Read file content safely
    try:
        file_bytes = await file.read()
    except Exception as exc:
        logger.error("Failed to read uploaded file: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read file payload.",
        ) from exc

    # Enforce size limit
    file_size = len(file_bytes)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the 40 MB limit (size: {file_size / (1024 * 1024):.1f} MB).",
        )

    # Sanitize filename & generate ID
    doc_id = str(uuid.uuid4())
    safe_name = sanitize_filename(file.filename)
    storage_path = f"documents/{doc_id}/{safe_name}"

    # Extract text & structural metadata
    try:
        extracted = extract_document(file_bytes, file.filename)
    except DocumentExtractionError as exc:
        logger.warning("Extraction error for %s: %s", file.filename, exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.error("Unexpected error extracting %s: %s", file.filename, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text extraction failed: {str(exc)}",
        ) from exc

    # Upload original file to Supabase Storage
    content_type = file.content_type or "application/octet-stream"
    try:
        upload_document_file(client, storage_path, file_bytes, content_type)
    except Exception as exc:
        logger.warning("Storage upload warning for %s: %s", storage_path, exc)

    # Create document record in database
    create_payload = DocumentCreate(
        id=doc_id,
        filename=safe_name,
        original_filename=file.filename,
        file_type=extracted.file_type,
        file_size=file_size,
        storage_path=storage_path,
        extracted_text=extracted.extracted_text,
        page_count=extracted.page_count,
        word_count=extracted.word_count,
        sentence_count=extracted.sentence_count,
        character_count=extracted.character_count,
        processing_status="processing",
    )

    try:
        created_row = repo.create_document(client, create_payload)
    except Exception as exc:
        logger.error("Failed to insert document record: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save document metadata in database.",
        ) from exc

    # Execute NLP Intelligence Pipeline (chunks, keywords, entities, summarization)
    try:
        process_document_nlp_pipeline(
            client=client,
            document_id=doc_id,
            raw_text=extracted.extracted_text,
            page_count=extracted.page_count
        )
    except Exception as exc:
        logger.error("Error executing NLP pipeline for %s: %s", doc_id, exc)

    # Fetch updated document row
    final_doc = repo.get_document(client, doc_id) or created_row
    return DocumentDetailResponse(document=DocumentDetail(**final_doc))


# ---------------------------------------------------------------------------
# List all documents (GET /api/documents)
# ---------------------------------------------------------------------------

@router.get("", response_model=DocumentListResponse)
def list_documents(client: Client = Depends(_db)) -> DocumentListResponse:
    """
    Return all documents from the database, ordered newest-first.
    """
    try:
        rows = repo.list_documents(client)
    except Exception as exc:
        logger.error("list_documents failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve documents. Check database connectivity.",
        ) from exc

    items = [DocumentListItem(**row) for row in rows]
    return DocumentListResponse(documents=items, total=len(items))


# ---------------------------------------------------------------------------
# Get single document (GET /api/documents/{document_id})
# ---------------------------------------------------------------------------

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: UUID,
    client: Client = Depends(_db),
) -> DocumentDetailResponse:
    """
    Return full metadata for one document.
    """
    try:
        row = repo.get_document(client, str(document_id))
    except Exception as exc:
        logger.error("get_document %s failed: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve document. Check database connectivity.",
        ) from exc

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found.",
        )

    return DocumentDetailResponse(document=DocumentDetail(**row))


# ---------------------------------------------------------------------------
# Delete document (DELETE /api/documents/{document_id})
# ---------------------------------------------------------------------------

@router.delete("/{document_id}", response_model=DeleteResponse)
def delete_document(
    document_id: UUID,
    client: Client = Depends(_db),
) -> DeleteResponse:
    """
    Delete a document, its storage file, and all related analysis records.
    """
    try:
        deleted = repo.delete_document(client, str(document_id))
    except Exception as exc:
        logger.error("delete_document %s failed: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deletion failed. Please try again.",
        ) from exc

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found.",
        )

    return DeleteResponse(success=True, message="Document deleted successfully.")
