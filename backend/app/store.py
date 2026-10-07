"""In-memory data for the kiosk. No database: data lives only while the server runs."""

from threading import Lock

# Prices are integer centavos: 4500 = ₱45.00.
PRODUCTS = [
    {"id": 1, "name": "Coffee", "price": 4500, "category": "Drinks"},
    {"id": 2, "name": "Sandwich", "price": 5000, "category": "Food"},
    {"id": 3, "name": "Soft Drink", "price": 3500, "category": "Drinks"},
    {"id": 4, "name": "Cookies", "price": 2500, "category": "Snacks"},
    {"id": 5, "name": "Bottled Water", "price": 2000, "category": "Drinks"},
    {"id": 6, "name": "Chocolate", "price": 2500, "category": "Snacks"},
]

PRODUCTS_BY_ID = {product["id"]: product for product in PRODUCTS}

# Completed transactions, keyed by reference. Requests are handled on several threads,
# so the counter and the dict are only changed while holding the lock.
_lock = Lock()
_transactions: dict[str, dict] = {}
_last_number = 0


def next_transaction_number() -> int:
    global _last_number
    with _lock:
        _last_number += 1
        return _last_number


def save_transaction(receipt: dict) -> None:
    with _lock:
        _transactions[receipt["reference"]] = receipt


def find_transaction(reference: str) -> dict | None:
    return _transactions.get(reference)


def transaction_count() -> int:
    return len(_transactions)


def clear_transactions() -> None:
    """Used by the tests so every test starts with no transactions."""
    global _last_number
    with _lock:
        _transactions.clear()
        _last_number = 0
