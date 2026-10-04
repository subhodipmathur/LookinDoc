"""
Supabase client singleton.

Initializes one shared client using service-role credentials from
app.core.config. Route handlers obtain the client via get_supabase_client().

The service-role key bypasses Row Level Security — it must NEVER be
returned to the frontend through any API response.
"""
from supabase import create_client, Client
from app.core.config import settings


_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Return the singleton Supabase client.

    Raises RuntimeError if required environment variables are not set, so
    startup failures are explicit and easy to diagnose.
    """
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the "
                "backend environment before starting the application."
            )
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


def reset_client() -> None:
    """Force the singleton to be re-created. Useful in tests."""
    global _client
    _client = None
