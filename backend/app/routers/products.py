import sqlite3

from fastapi import APIRouter, Depends

from app.database import get_db
from app.schemas import Product

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[Product])
def list_products(db: sqlite3.Connection = Depends(get_db)) -> list[dict]:
    rows = db.execute("SELECT id, name, price, category FROM products ORDER BY id").fetchall()
    return [dict(row) for row in rows]
