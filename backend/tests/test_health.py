from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from app.main import app, validation_message

client = TestClient(app)


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


def test_validation_message_names_the_field():
    exc = RequestValidationError(
        [{"loc": ("body", "items", 0, "quantity"), "msg": "Input should be greater than 0", "type": "greater_than"}]
    )

    assert validation_message(exc) == "items.0.quantity: Input should be greater than 0."


def test_validation_message_strips_pydantic_prefix():
    exc = RequestValidationError(
        [{"loc": ("body",), "msg": "Value error, Items cannot be empty.", "type": "value_error"}]
    )

    assert validation_message(exc) == "Items cannot be empty."
