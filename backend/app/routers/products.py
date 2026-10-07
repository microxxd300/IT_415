from fastapi import APIRouter

from app.schemas import Product
from app.store import PRODUCTS

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[Product])
def list_products() -> list[dict]:
    return PRODUCTS
