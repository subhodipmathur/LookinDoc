"""
Document API endpoints.

Phase 3 surface:
  GET  /api/documents              → list all documents
  GET  /api/documents/{id}         → single document detail
  DELETE /api/documents/{id}       → delete document + storage + children

The upload endpoint (POST /api/documents/upload) will be added in Phase 4
when real file processing is implemented.
"""
from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.repositories import document_repository as repo
from app.schemas.document import (
    DocumentDetailResponse,
    DocumentListItem,
    DocumentListResponse,
    DeleteResponse,
)
from app.services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


# ---------------------------------------------------------------------------
# Dependency — inject Supabase client & surface config errors cleanly
# ---------------------------------------------------------------------------

def _db(client: Client = Depends(get_supabase_client)) -> Client:
    return client


# ---------------------------------------------------------------------------
# List all documents
# ---------------------------------------------------------------------------

@router.get("", response_model=DocumentListResponse)
def list_documents(client: Client = Depends(_db)) -> DocumentListResponse:
    """
    Return all documents from the database, ordered newest-first.

    Only lightweight metadata is returned — extracted_text is excluded to
    keep the library response small.
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
# Get single document
# ---------------------------------------------------------------------------

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: UUID,
    client: Client = Depends(_db),
) -> DocumentDetailResponse:
    """
    Return full metadata for one document.

    Returns 404 if the document does not exist.
    The raw extracted_text field is intentionally excluded from the response.
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

    from app.schemas.document import DocumentDetail
    return DocumentDetailResponse(document=DocumentDetail(**row))


# ---------------------------------------------------------------------------
# Delete document
# ---------------------------------------------------------------------------

@router.delete("/{document_id}", response_model=DeleteResponse)
def delete_document(
    document_id: UUID,
    client: Client = Depends(_db),
) -> DeleteResponse:
    """
    Delete a document, its storage file, and all related analysis records.

    Related records (keywords, entities, summaries, chunks) are removed via
    ON DELETE CASCADE configured in the database schema.

    Returns 404 if the document does not exist.
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
