import pytest
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from app.main import app, validation_message

client = TestClient(app)


@pytest.fixture
def crashing_client():
    """Adds a route that always raises, so the 500 handler can be tested; removed afterwards."""

    def crash():
        raise RuntimeError("simulated server bug")

    app.add_api_route("/api/test-crash", crash)
    yield TestClient(app, raise_server_exceptions=False)
    app.router.routes.pop()


def test_health_returns_ok():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unknown_route_returns_detail_sentence():
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_cors_allows_the_vite_dev_server():
    response = client.options(
        "/api/health",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_other_origins():
    response = client.options(
        "/api/health",
        headers={"Origin": "http://example.com", "Access-Control-Request-Method": "GET"},
    )

    assert "access-control-allow-origin" not in response.headers


def test_server_error_returns_detail_with_cors_header(crashing_client):
    response = crashing_client.get("/api/test-crash", headers={"Origin": "http://localhost:5173"})

    assert response.status_code == 500
    assert response.json() == {"detail": "Something went wrong on the server. Please ask staff for help."}
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_server_error_has_no_cors_header_for_other_origins(crashing_client):
    response = crashing_client.get("/api/test-crash", headers={"Origin": "http://example.com"})

    assert response.status_code == 500
    assert "access-control-allow-origin" not in response.headers


def test_validation_message_names_an_unknown_field():
    exc = RequestValidationError(
        [{"loc": ("body", "customer", "name"), "msg": "Field required", "type": "missing"}]
    )

    assert validation_message(exc) == "customer.name: Field required."


def test_validation_message_is_friendly_for_known_fields():
    exc = RequestValidationError(
        [{"loc": ("body", "items", 0, "quantity"), "msg": "Input should be greater than 0", "type": "greater_than"}]
    )

    assert validation_message(exc) == "Quantity must be between 1 and 99."


def test_validation_message_strips_pydantic_prefix():
    exc = RequestValidationError(
        [{"loc": ("body",), "msg": "Value error, Items cannot be empty.", "type": "value_error"}]
    )

    assert validation_message(exc) == "Items cannot be empty."
