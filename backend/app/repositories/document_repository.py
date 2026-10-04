"""
Document repository — all direct Supabase table operations live here.
Tables managed: documents, keywords, entities, summaries, chunks.
"""
from __future__ import annotations

import logging
from typing import Optional, List, Dict, Any

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
_TABLE_DOCUMENTS = "documents"
_TABLE_CHUNKS = "chunks"
_TABLE_KEYWORDS = "keywords"
_TABLE_ENTITIES = "entities"
_TABLE_SUMMARIES = "summaries"


# ---------------------------------------------------------------------------
# Documents Table Operations
# ---------------------------------------------------------------------------

def list_documents(client: Client) -> list[dict]:
    """Return all documents ordered newest-first (no extracted_text)."""
    response = (
        client.table(_TABLE_DOCUMENTS)
        .select(_LIST_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def get_document(client: Client, document_id: str) -> Optional[dict]:
    """Return a single document by UUID, or None if not found."""
    response = (
        client.table(_TABLE_DOCUMENTS)
        .select(_DETAIL_COLUMNS)
        .eq("id", document_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def get_document_raw_text(client: Client, document_id: str) -> Optional[str]:
    """Retrieve full extracted text for NLP processing and searches."""
    response = (
        client.table(_TABLE_DOCUMENTS)
        .select("extracted_text")
        .eq("id", document_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0].get("extracted_text") if rows else None


def create_document(client: Client, data: DocumentCreate) -> dict:
    """Insert a new document record and return the created row."""
    payload = data.model_dump(exclude_none=True)
    response = client.table(_TABLE_DOCUMENTS).insert(payload).execute()
    return response.data[0]


def update_document(client: Client, document_id: str, data: DocumentUpdate) -> Optional[dict]:
    """Patch an existing document and return the updated row, or None if not found."""
    payload = data.model_dump(exclude_none=True)
    if not payload:
        return get_document(client, document_id)
    response = (
        client.table(_TABLE_DOCUMENTS)
        .update(payload)
        .eq("id", document_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def delete_document(client: Client, document_id: str) -> bool:
    """
    Delete a document record and its storage file.
    Related analysis records are removed via ON DELETE CASCADE in PostgreSQL.
    """
    doc = get_document(client, document_id)
    if doc is None:
        return False

    storage_path: Optional[str] = doc.get("storage_path")

    # 1. Delete from storage (best-effort)
    if storage_path:
        try:
            client.storage.from_("documents").remove([storage_path])
            logger.info("Deleted storage object: %s", storage_path)
        except Exception as exc:
            logger.warning("Could not delete storage object %s: %s", storage_path, exc)

    # 2. Delete the database record (cascade deletes children)
    client.table(_TABLE_DOCUMENTS).delete().eq("id", document_id).execute()
    logger.info("Deleted document record: %s", document_id)
    return True


# ---------------------------------------------------------------------------
# Chunks Table Operations
# ---------------------------------------------------------------------------

def save_document_chunks(client: Client, document_id: str, chunks: List[Any]) -> None:
    """Batch insert document text chunks for passage retrieval and search."""
    if not chunks:
        return
    # Delete existing chunks first to avoid duplicates if re-processed
    client.table(_TABLE_CHUNKS).delete().eq("document_id", document_id).execute()

    payload = [
        {
            "document_id": document_id,
            "chunk_index": c.chunk_index if hasattr(c, "chunk_index") else c["chunk_index"],
            "text": c.text if hasattr(c, "text") else c["text"],
            "start_position": c.start_position if hasattr(c, "start_position") else c["start_position"],
            "end_position": c.end_position if hasattr(c, "end_position") else c["end_position"],
        }
        for c in chunks
    ]
    client.table(_TABLE_CHUNKS).insert(payload).execute()


def get_document_chunks(client: Client, document_id: str) -> List[Dict[str, Any]]:
    """Return all document chunks ordered by chunk_index."""
    response = (
        client.table(_TABLE_CHUNKS)
        .select("id, document_id, chunk_index, text, start_position, end_position")
        .eq("document_id", document_id)
        .order("chunk_index", desc=False)
        .execute()
    )
    return response.data or []


# ---------------------------------------------------------------------------
# Keywords Table Operations
# ---------------------------------------------------------------------------

def save_document_keywords(client: Client, document_id: str, keywords: List[Dict[str, Any]]) -> None:
    """Batch insert TF-IDF extracted keywords."""
    if not keywords:
        return
    client.table(_TABLE_KEYWORDS).delete().eq("document_id", document_id).execute()

    payload = [
        {
            "document_id": document_id,
            "keyword": kw["keyword"],
            "score": kw["score"],
            "rank": kw["rank"],
        }
        for kw in keywords
    ]
    client.table(_TABLE_KEYWORDS).insert(payload).execute()


def get_document_keywords(client: Client, document_id: str) -> List[Dict[str, Any]]:
    """Return keywords ordered by rank."""
    response = (
        client.table(_TABLE_KEYWORDS)
        .select("id, document_id, keyword, score, rank")
        .eq("document_id", document_id)
        .order("rank", desc=False)
        .execute()
    )
    return response.data or []


# ---------------------------------------------------------------------------
# Entities Table Operations
# ---------------------------------------------------------------------------

def save_document_entities(client: Client, document_id: str, entities: List[Dict[str, Any]]) -> None:
    """Batch insert spaCy extracted named entities."""
    if not entities:
        return
    client.table(_TABLE_ENTITIES).delete().eq("document_id", document_id).execute()

    # Limit to top 200 distinct entities to optimize DB storage
    payload = [
        {
            "document_id": document_id,
            "entity_text": ent["entity_text"],
            "entity_label": ent["entity_label"],
            "start_position": ent["start_position"],
            "end_position": ent["end_position"],
        }
        for ent in entities[:200]
    ]
    client.table(_TABLE_ENTITIES).insert(payload).execute()


def get_document_entities(client: Client, document_id: str) -> List[Dict[str, Any]]:
    """Return all named entities for a document."""
    response = (
        client.table(_TABLE_ENTITIES)
        .select("id, document_id, entity_text, entity_label, start_position, end_position")
        .eq("document_id", document_id)
        .execute()
    )
    return response.data or []


# ---------------------------------------------------------------------------
# Summaries Table Operations
# ---------------------------------------------------------------------------

def save_document_summary(
    client: Client,
    document_id: str,
    summary_text: str,
    sentence_count: int
) -> Dict[str, Any]:
    """Save or update extractive summary for a document."""
    client.table(_TABLE_SUMMARIES).delete().eq("document_id", document_id).execute()
    
    payload = {
        "document_id": document_id,
        "summary_text": summary_text,
        "sentence_count": sentence_count,
    }
    response = client.table(_TABLE_SUMMARIES).insert(payload).execute()
    return response.data[0] if response.data else payload


def get_document_summary(client: Client, document_id: str) -> Optional[Dict[str, Any]]:
    """Return extractive summary for a document."""
    response = (
        client.table(_TABLE_SUMMARIES)
        .select("id, document_id, summary_text, sentence_count, created_at")
        .eq("document_id", document_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None
