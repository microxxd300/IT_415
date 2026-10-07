"""Creating and finding completed transactions."""

from datetime import datetime

from app.schemas import TransactionRequest
from app.services.pricing import build_lines, calculate_total, compute_change, validate_cash
from app.store import PRODUCTS_BY_ID, find_transaction, next_transaction_number, save_transaction

METHOD_LABELS = {"cash": "Cash", "qr": "QR Payment", "card": "Credit/Debit Card"}


def make_reference(number: int, when: datetime) -> str:
    # Date and time keep references unique even after a restart resets the counter.
    return f"TXN-{when:%Y%m%d-%H%M%S}-{number:03d}"


def create_transaction(request: TransactionRequest) -> dict:
    """Price, validate and save one transaction. Raises PricingError before anything is saved."""
    # 1. Price the order from the server's own product list; client prices are never used.
    lines = build_lines([item.model_dump() for item in request.items], PRODUCTS_BY_ID)
    total = calculate_total(lines)

    # 2. Check the payment. QR and card are simulated: they always pay exactly the total.
    if request.payment_method == "cash":
        validate_cash(request.amount_paid, total)
        amount_paid = request.amount_paid
    else:
        amount_paid = total

    # 3. Only a valid payment gets a reference and is saved.
    created_at = datetime.now().astimezone()
    receipt = {
        "reference": make_reference(next_transaction_number(), created_at),
        "created_at": created_at,
        "items": lines,
        "total": total,
        "payment_method": request.payment_method,
        "payment_method_label": METHOD_LABELS[request.payment_method],
        "amount_paid": amount_paid,
        "change": compute_change(amount_paid, total),
        "status": "Payment Successful",
    }
    save_transaction(receipt)
    return receipt


def get_transaction(reference: str) -> dict | None:
    return find_transaction(reference)
