"""Pydantic models for API responses and requests. All money is in integer centavos."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, StrictInt, model_validator

from app.services.pricing import MAX_QUANTITY

PaymentMethod = Literal["cash", "qr", "card"]


class Product(BaseModel):
    id: int
    name: str
    price: int  # centavos: 4500 = ₱45.00
    category: str


class OrderItem(BaseModel):
    # StrictInt: "2", 2.5 and true are rejected instead of being silently converted.
    product_id: StrictInt
    quantity: StrictInt = Field(ge=1, le=MAX_QUANTITY)


class TransactionRequest(BaseModel):
    # Any other fields the client sends (for example a "price") are ignored.
    items: list[OrderItem] = Field(min_length=1)
    payment_method: PaymentMethod
    amount_paid: StrictInt | None = None  # centavos; required for cash, ignored for qr and card

    @model_validator(mode="after")
    def cash_needs_amount_paid(self) -> "TransactionRequest":
        if self.payment_method == "cash":
            if self.amount_paid is None:
                raise ValueError("Please enter the amount paid for a cash payment.")
            if self.amount_paid < 0:
                raise ValueError("Amount paid cannot be negative.")
        return self


class ReceiptLine(BaseModel):
    product_id: int
    name: str
    unit_price: int
    quantity: int
    subtotal: int


class Receipt(BaseModel):
    reference: str
    created_at: datetime
    items: list[ReceiptLine]
    total: int
    payment_method: PaymentMethod
    payment_method_label: str
    amount_paid: int
    change: int
    status: str
