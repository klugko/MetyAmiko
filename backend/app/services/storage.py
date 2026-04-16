import logging

from supabase import create_client

from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_client():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def upload_file(path: str, content: bytes, content_type: str) -> str:
    client = _get_client()
    client.storage.from_(settings.SUPABASE_BUCKET).upload(
        path, content, {"content-type": content_type}
    )
    return path


def download_file(path: str) -> bytes:
    client = _get_client()
    return client.storage.from_(settings.SUPABASE_BUCKET).download(path)


def get_signed_url(path: str, expires_in: int = 3600) -> str:
    client = _get_client()
    result = client.storage.from_(settings.SUPABASE_BUCKET).create_signed_url(
        path, expires_in
    )
    return result["signedURL"]


def delete_file(path: str) -> None:
    client = _get_client()
    client.storage.from_(settings.SUPABASE_BUCKET).remove([path])
