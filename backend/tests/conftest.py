import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import clear_transactions


@pytest.fixture(autouse=True)
def no_transactions():
    """Every test starts with no saved transactions and the counter at 0."""
    clear_transactions()
    yield
    clear_transactions()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
