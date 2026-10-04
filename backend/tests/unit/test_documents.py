import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.supabase_service import get_supabase_client

client = TestClient(app)

@pytest.fixture
def mock_supabase():
    """Mock Supabase client fixture."""
    mock = MagicMock()
    return mock

def test_list_documents_empty(mock_supabase):
    """Test GET /api/documents when no documents exist."""
    # Setup mock chain: client.table("documents").select(...).order(...).execute()
    mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value.data = []
    
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.get("/api/documents")
        assert response.status_code == 200
        data = response.json()
        assert data["documents"] == []
        assert data["total"] == 0
    finally:
        app.dependency_overrides.clear()

def test_list_documents_with_data(mock_supabase):
    """Test GET /api/documents returning document list."""
    mock_doc = {
        "id": "11111111-1111-1111-1111-111111111111",
        "filename": "test.pdf",
        "original_filename": "test.pdf",
        "file_type": "pdf",
        "file_size": 1024,
        "processing_status": "ready",
        "word_count": 250,
        "page_count": 1,
        "created_at": "2026-10-04T00:00:00Z",
        "updated_at": "2026-10-04T00:00:00Z"
    }
    mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value.data = [mock_doc]
    
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.get("/api/documents")
        assert response.status_code == 200
        data = response.json()
        assert len(data["documents"]) == 1
        assert data["total"] == 1
        assert data["documents"][0]["id"] == mock_doc["id"]
        assert data["documents"][0]["filename"] == "test.pdf"
    finally:
        app.dependency_overrides.clear()

def test_get_document_success(mock_supabase):
    """Test GET /api/documents/{id} for an existing document."""
    doc_id = "11111111-1111-1111-1111-111111111111"
    mock_doc = {
        "id": doc_id,
        "filename": "test.pdf",
        "original_filename": "test.pdf",
        "file_type": "pdf",
        "file_size": 1024,
        "storage_path": f"documents/{doc_id}/test.pdf",
        "processing_status": "ready",
        "word_count": 250,
        "page_count": 1,
        "sentence_count": 15,
        "character_count": 1400,
        "created_at": "2026-10-04T00:00:00Z",
        "updated_at": "2026-10-04T00:00:00Z"
    }
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [mock_doc]
    
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.get(f"/api/documents/{doc_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["document"]["id"] == doc_id
        assert data["document"]["word_count"] == 250
        assert data["document"]["sentence_count"] == 15
    finally:
        app.dependency_overrides.clear()

def test_get_document_not_found(mock_supabase):
    """Test GET /api/documents/{id} for a non-existent document."""
    doc_id = "11111111-1111-1111-1111-111111111111"
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = []
    
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.get(f"/api/documents/{doc_id}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()

def test_get_document_invalid_uuid():
    """Test GET /api/documents/{id} with an invalid UUID format."""
    response = client.get("/api/documents/invalid-uuid-123")
    assert response.status_code == 422

def test_delete_document_success(mock_supabase):
    """Test DELETE /api/documents/{id} successfully deleting document."""
    doc_id = "11111111-1111-1111-1111-111111111111"
    mock_doc = {
        "id": doc_id,
        "filename": "test.pdf",
        "storage_path": f"documents/{doc_id}/test.pdf"
    }
    # get_document finds it
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [mock_doc]
    # delete succeeds
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = [{"id": doc_id}]
    # storage remove succeeds
    mock_supabase.storage.from_.return_value.remove.return_value = None

    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.delete(f"/api/documents/{doc_id}")
        assert response.status_code == 200
        assert response.json() == {"success": True, "message": "Document deleted successfully."}
    finally:
        app.dependency_overrides.clear()

def test_delete_document_not_found(mock_supabase):
    """Test DELETE /api/documents/{id} for non-existent document."""
    doc_id = "11111111-1111-1111-1111-111111111111"
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = []
    
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.delete(f"/api/documents/{doc_id}")
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()
