import pytest
import uuid
from app.core.config import settings
from app.services.supabase_service import get_supabase_client
from app.repositories import document_repository as repo
from app.schemas.document import DocumentCreate, DocumentUpdate

# Skip if credentials not set
pytestmark = pytest.mark.skipif(
    not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY,
    reason="Supabase credentials not configured."
)

def test_supabase_live_lifecycle():
    """
    Live Supabase integration test for document CRUD lifecycle:
    1. Create a temporary test document record
    2. Retrieve it via get_document
    3. List documents and verify presence
    4. Update metadata
    5. Delete document
    6. Verify it is gone
    """
    try:
        client = get_supabase_client()
        # Verify connection
        res = client.table("documents").select("id").limit(1).execute()
    except Exception as e:
        pytest.skip(f"Supabase tables not yet migrated or unreachable: {e}")

    test_filename = f"integration_test_{uuid.uuid4().hex[:8]}.pdf"
    
    # 1. Create
    create_payload = DocumentCreate(
        filename=test_filename,
        original_filename=test_filename,
        file_type="pdf",
        file_size=2048,
        storage_path=f"documents/test/{test_filename}",
        processing_status="pending"
    )
    created = repo.create_document(client, create_payload)
    doc_id = created["id"]
    assert created["filename"] == test_filename
    assert created["processing_status"] == "pending"

    try:
        # 2. Get
        fetched = repo.get_document(client, doc_id)
        assert fetched is not None
        assert fetched["id"] == doc_id
        assert fetched["filename"] == test_filename

        # 3. List
        all_docs = repo.list_documents(client)
        found = any(d["id"] == doc_id for d in all_docs)
        assert found is True

        # 4. Update
        updated = repo.update_document(
            client, 
            doc_id, 
            DocumentUpdate(processing_status="ready", word_count=100, page_count=2)
        )
        assert updated is not None
        assert updated["processing_status"] == "ready"
        assert updated["word_count"] == 100

    finally:
        # 5. Clean up - Delete
        deleted = repo.delete_document(client, doc_id)
        assert deleted is True

        # 6. Verify deleted
        post_delete = repo.get_document(client, doc_id)
        assert post_delete is None
