import sqlite3

from app.database import DEFAULT_DB_PATH, get_db_path, init_db

EXPECTED_PRODUCTS = [
    {"id": 1, "name": "Coffee", "price": 4500, "category": "Drinks"},
    {"id": 2, "name": "Sandwich", "price": 5000, "category": "Food"},
    {"id": 3, "name": "Soft Drink", "price": 3500, "category": "Drinks"},
    {"id": 4, "name": "Cookies", "price": 2500, "category": "Snacks"},
    {"id": 5, "name": "Bottled Water", "price": 2000, "category": "Drinks"},
    {"id": 6, "name": "Chocolate", "price": 2500, "category": "Snacks"},
]


def test_products_returns_the_six_seeded_products(client):
    response = client.get("/api/products")

    assert response.status_code == 200
    assert response.json() == EXPECTED_PRODUCTS


def test_prices_are_integer_centavos(client):
    products = client.get("/api/products").json()

    assert all(type(product["price"]) is int for product in products)


def test_seeding_twice_does_not_duplicate_products(client, db_path):
    init_db()  # the app already ran it once at startup

    assert len(client.get("/api/products").json()) == 6


def test_all_tables_are_created(client, db_path):
    connection = sqlite3.connect(db_path)
    rows = connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall()
    connection.close()

    assert {"products", "transactions", "transaction_items"} <= {row[0] for row in rows}


def test_tests_use_a_temporary_database(client, db_path):
    assert get_db_path() == str(db_path)
    assert db_path.exists()
    assert db_path != DEFAULT_DB_PATH
