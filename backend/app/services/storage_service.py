"""
Supabase storage service for uploading, downloading, and removing document files.
"""
import logging
from supabase import Client

logger = logging.getLogger(__name__)

BUCKET_NAME = "documents"

def upload_document_file(
    client: Client,
    storage_path: str,
    file_bytes: bytes,
    content_type: str = "application/octet-stream"
) -> str:
    """
    Upload file bytes to Supabase Storage bucket 'documents'.
    Returns the storage path.
    """
    try:
        # storage3 upload takes (path, file, file_options)
        response = client.storage.from_(BUCKET_NAME).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        logger.info("Successfully uploaded file to storage: %s", storage_path)
        return storage_path
    except Exception as e:
        logger.error("Failed to upload file to Supabase storage (%s): %s", storage_path, e)
        # Even if storage upload encounters an issue (e.g. bucket permission), we don't crash
        # the entire pipeline if DB record can proceed, but we log appropriately
        raise RuntimeError(f"Storage upload failed: {str(e)}") from e

def delete_document_file(client: Client, storage_path: str) -> bool:
    """Delete a file from Supabase Storage bucket 'documents'."""
    try:
        client.storage.from_(BUCKET_NAME).remove([storage_path])
        logger.info("Successfully removed storage file: %s", storage_path)
        return True
    except Exception as e:
        logger.warning("Could not delete storage file %s: %s", storage_path, e)
        return False
