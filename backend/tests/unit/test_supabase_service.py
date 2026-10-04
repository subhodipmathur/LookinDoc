import pytest
from app.core.config import settings
from app.services.supabase_service import get_supabase_client, reset_client

def test_supabase_service_missing_env(monkeypatch):
    """Test that get_supabase_client raises RuntimeError when env vars are missing."""
    reset_client()
    monkeypatch.setattr(settings, "SUPABASE_URL", "")
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_KEY", "")
    
    with pytest.raises(RuntimeError) as exc_info:
        get_supabase_client()
    
    assert "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set" in str(exc_info.value)
    reset_client()
