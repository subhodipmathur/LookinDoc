import io
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.supabase_service import get_supabase_client

client = TestClient(app)

def test_upload_txt_success():
    mock_supabase = MagicMock()
    doc_id = "22222222-2222-2222-2222-222222222222"
    
    mock_doc = {
        "id": doc_id,
        "filename": "sample.txt",
        "original_filename": "sample.txt",
        "file_type": "txt",
        "file_size": 120,
        "storage_path": f"documents/{doc_id}/sample.txt",
        "processing_status": "ready",
        "word_count": 15,
        "page_count": 1,
        "sentence_count": 2,
        "character_count": 120,
        "created_at": "2026-10-04T00:00:00Z",
        "updated_at": "2026-10-04T00:00:00Z"
    }

    mock_supabase.storage.from_.return_value.upload.return_value = None
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [mock_doc]
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [mock_doc]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [mock_doc]
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []

    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        content = b"LookinDoc is processing this sample document. Text extraction works accurately."
        response = client.post(
            "/api/documents/upload",
            files={"file": ("sample.txt", io.BytesIO(content), "text/plain")}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["document"]["filename"] == "sample.txt"
        assert data["document"]["file_type"] == "txt"
        assert data["document"]["processing_status"] == "ready"
    finally:
        app.dependency_overrides.clear()

def test_upload_unsupported_file_type():
    content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR..."
    response = client.post(
        "/api/documents/upload",
        files={"file": ("sample.png", io.BytesIO(content), "image/png")}
    )
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()

def test_upload_empty_file():
    response = client.post(
        "/api/documents/upload",
        files={"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
