from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.supabase_service import get_supabase_client

client = TestClient(app)

SAMPLE_TEXT = (
    "Natural Language Processing enables document intelligence. "
    "Google and Microsoft build modern AI infrastructure. "
    "TF-IDF extracts key statistical terms. "
    "Extractive summarization preserves original phrasing without hallucinating."
)

def test_nlp_endpoint_analysis():
    mock_supabase = MagicMock()
    doc_id = "33333333-3333-3333-3333-333333333333"

    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [
        {"extracted_text": SAMPLE_TEXT, "page_count": 1}
    ]
    # keywords & entities table select
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.get(f"/api/documents/{doc_id}/analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["document_id"] == doc_id
        assert data["statistics"]["word_count"] > 10
        assert len(data["keywords"]) > 0
        assert "summary" in data
    finally:
        app.dependency_overrides.clear()

def test_nlp_endpoint_search():
    mock_supabase = MagicMock()
    doc_id = "33333333-3333-3333-3333-333333333333"

    mock_chunks = [
        {"id": "c1", "document_id": doc_id, "chunk_index": 0, "text": "Google and Microsoft build modern AI infrastructure.", "start_position": 0, "end_position": 50},
        {"id": "c2", "document_id": doc_id, "chunk_index": 1, "text": "TF-IDF extracts key statistical terms.", "start_position": 51, "end_position": 100},
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = mock_chunks

    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.post(
            f"/api/documents/{doc_id}/search",
            json={"query": "AI infrastructure", "top_k": 3}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "AI infrastructure"
        assert len(data["results"]) > 0
        assert data["results"][0]["chunk_index"] == 0
    finally:
        app.dependency_overrides.clear()

def test_nlp_endpoint_question():
    mock_supabase = MagicMock()
    doc_id = "33333333-3333-3333-3333-333333333333"

    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [
        {"extracted_text": SAMPLE_TEXT}
    ]
    mock_chunks = [
        {"id": "c1", "document_id": doc_id, "chunk_index": 0, "text": "Google and Microsoft build modern AI infrastructure.", "start_position": 0, "end_position": 50},
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = mock_chunks

    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    try:
        response = client.post(
            f"/api/documents/{doc_id}/question",
            json={"question": "Who builds AI infrastructure?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert data["relevance_score"] > 0
    finally:
        app.dependency_overrides.clear()
