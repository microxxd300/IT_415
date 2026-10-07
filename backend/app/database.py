"""SQLite storage: connection helpers, table creation and product seed data."""

import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path

# backend/kiosk.db, no matter which folder uvicorn is started from.
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "kiosk.db"

# (name, price in centavos, category)
SEED_PRODUCTS = [
    ("Coffee", 4500, "Drinks"),
    ("Sandwich", 5000, "Food"),
    ("Soft Drink", 3500, "Drinks"),
    ("Cookies", 2500, "Snacks"),
    ("Bottled Water", 2000, "Drinks"),
    ("Chocolate", 2500, "Snacks"),
]

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL UNIQUE,
    price    INTEGER NOT NULL CHECK (price > 0),
    category TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    reference      TEXT    UNIQUE,
    created_at     TEXT    NOT NULL,
    payment_method TEXT    NOT NULL CHECK (payment_method IN ('cash', 'qr', 'card')),
    total          INTEGER NOT NULL CHECK (total > 0),
    amount_paid    INTEGER NOT NULL CHECK (amount_paid >= total),
    change_due     INTEGER NOT NULL CHECK (change_due >= 0)
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL REFERENCES transactions (id),
    product_id     INTEGER NOT NULL REFERENCES products (id),
    name           TEXT    NOT NULL,
    unit_price     INTEGER NOT NULL,
    quantity       INTEGER NOT NULL CHECK (quantity > 0),
    subtotal       INTEGER NOT NULL
);
"""


def get_db_path() -> str:
    """Tests set KIOSK_DB to a temporary file; the app uses backend/kiosk.db."""
    return os.environ.get("KIOSK_DB", str(DEFAULT_DB_PATH))


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(get_db_path())
    connection.row_factory = sqlite3.Row  # read columns by name: row["price"]
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one connection per request, always closed afterwards."""
    connection = connect()
    try:
        yield connection
    finally:
        connection.close()


def init_db() -> None:
    """Create the tables and insert the products the first time only."""
    connection = connect()
    try:
        with connection:  # commits on success, rolls back on error
            connection.executescript(SCHEMA)
            product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
            if product_count == 0:
                connection.executemany(
                    "INSERT INTO products (name, price, category) VALUES (?, ?, ?)",
                    SEED_PRODUCTS,
                )
    finally:
        connection.close()
