"""FastAPI application for the Campus Store touchscreen POS kiosk."""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers import products, transactions

LOCAL_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]  # the Vite dev server


def allowed_origins() -> list[str]:
    """Local dev server plus deployed frontends from KIOSK_ALLOWED_ORIGINS (comma-separated URLs)."""
    extra = os.environ.get("KIOSK_ALLOWED_ORIGINS", "")
    return LOCAL_ORIGINS + [origin.strip().rstrip("/") for origin in extra.split(",") if origin.strip()]


ALLOWED_ORIGINS = allowed_origins()

# Customer-friendly messages for invalid fields; the kiosk shows "detail" as it is.
FIELD_MESSAGES = {
    "items": "Your order must contain at least one item.",
    "product_id": "One of the products in your order is not valid.",
    "quantity": "Quantity must be between 1 and 99.",
    "payment_method": "Please choose Cash, QR Payment or Credit/Debit Card.",
    "amount_paid": "Please enter a valid amount paid.",
}

app = FastAPI(title="Campus Store POS Kiosk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def validation_message(exc: RequestValidationError) -> str:
    """Turn the first Pydantic validation error into one readable sentence."""
    error = exc.errors()[0]
    field_names = [part for part in error["loc"] if isinstance(part, str) and part != "body"]
    if field_names and field_names[-1] in FIELD_MESSAGES:
        return FIELD_MESSAGES[field_names[-1]]
    field = ".".join(str(part) for part in error["loc"] if part != "body")
    message = str(error["msg"]).removeprefix("Value error, ").rstrip(".")
    return f"{field}: {message}." if field else f"{message}."


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": validation_message(exc)})


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # 500 responses are sent from outside CORSMiddleware, so the CORS header is added here;
    # without it the browser hides this message from the kiosk.
    headers = {}
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        headers = {"Access-Control-Allow-Origin": origin, "Vary": "Origin"}
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on the server. Please ask staff for help."},
        headers=headers,
    )


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(transactions.router)
