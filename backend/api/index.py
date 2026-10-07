"""Vercel entry point: Vercel runs files in api/ as Python serverless functions."""

import sys
from pathlib import Path

# Make the backend folder importable, so "app" means backend/app.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402  (Vercel serves this FastAPI app)
