"""
Document repository — all direct Supabase table operations live here.

Route handlers call these functions with a pre-built Client. This keeps
PostgREST queries out of the router layer and makes it straightforward to
mock in unit tests.
"""
from __future__ import annotations

import logging
from typing import Optional

from supabase import Client

from app.schemas.document import DocumentCreate, DocumentUpdate

logger = logging.getLogger(__name__)

# Columns returned in the list view (avoids sending extracted_text for every row)
_LIST_COLUMNS = (
    "id, filename, original_filename, file_type, file_size, "
    "processing_status, word_count, page_count, created_at, updated_at"
)
_DETAIL_COLUMNS = (
    "id, filename, original_filename, file_type, file_size, storage_path, "
    "processing_status, word_count, page_count, sentence_count, "
    "character_count, created_at, updated_at"
)
_TABLE = "documents"


def list_documents(client: Client) -> list[dict]:
    """Return all documents ordered newest-first (no extracted_text)."""
    response = (
        client.table(_TABLE)
        .select(_LIST_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def get_document(client: Client, document_id: str) -> Optional[dict]:
    """Return a single document by UUID, or None if not found."""
    response = (
        client.table(_TABLE)
        .select(_DETAIL_COLUMNS)
        .eq("id", document_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def create_document(client: Client, data: DocumentCreate) -> dict:
    """Insert a new document record and return the created row."""
    payload = data.model_dump(exclude_none=True)
    response = client.table(_TABLE).insert(payload).execute()
    return response.data[0]


def update_document(client: Client, document_id: str, data: DocumentUpdate) -> Optional[dict]:
    """Patch an existing document and return the updated row, or None if not found."""
    payload = data.model_dump(exclude_none=True)
    if not payload:
        return get_document(client, document_id)
    response = (
        client.table(_TABLE)
        .update(payload)
        .eq("id", document_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def delete_document(client: Client, document_id: str) -> bool:
    """
    Delete a document record and its storage file.

    Related analysis records (keywords, entities, summaries, chunks) are
    removed automatically via ON DELETE CASCADE defined in the schema.

    Returns True if a row was deleted, False if the document did not exist.
    """
    # Fetch storage_path before deleting so we can clean up storage
    doc = get_document(client, document_id)
    if doc is None:
        return False

    storage_path: Optional[str] = doc.get("storage_path")

    # 1. Delete from storage (best-effort; if it fails we still remove the DB record)
    if storage_path:
        try:
            client.storage.from_("documents").remove([storage_path])
            logger.info("Deleted storage object: %s", storage_path)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not delete storage object %s: %s", storage_path, exc)

    # 2. Delete the database record (cascade takes care of child rows)
    client.table(_TABLE).delete().eq("id", document_id).execute()
    logger.info("Deleted document record: %s", document_id)
    return True
