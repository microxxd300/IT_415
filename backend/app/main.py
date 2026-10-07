"""FastAPI application for the Campus Store touchscreen POS kiosk."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers import products

# The Vite dev server can be opened with either host name.
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

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
