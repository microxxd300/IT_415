import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    """Point the app at a fresh temporary database file; kiosk.db is never touched."""
    path = tmp_path / "test_kiosk.db"
    monkeypatch.setenv("KIOSK_DB", str(path))
    return path


@pytest.fixture
def client(db_path):
    # Using the client as a context manager runs the startup code (init_db).
    with TestClient(app) as test_client:
        yield test_client
