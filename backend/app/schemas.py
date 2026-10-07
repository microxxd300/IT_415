"""Pydantic models for API responses and requests. All money is in integer centavos."""

from pydantic import BaseModel


class Product(BaseModel):
    id: int
    name: str
    price: int  # centavos: 4500 = ₱45.00
    category: str
