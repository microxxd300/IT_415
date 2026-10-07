EXPECTED_PRODUCTS = [
    {"id": 1, "name": "Coffee", "price": 4500, "category": "Drinks"},
    {"id": 2, "name": "Sandwich", "price": 5000, "category": "Food"},
    {"id": 3, "name": "Soft Drink", "price": 3500, "category": "Drinks"},
    {"id": 4, "name": "Cookies", "price": 2500, "category": "Snacks"},
    {"id": 5, "name": "Bottled Water", "price": 2000, "category": "Drinks"},
    {"id": 6, "name": "Chocolate", "price": 2500, "category": "Snacks"},
]


def test_products_returns_the_six_products(client):
    response = client.get("/api/products")

    assert response.status_code == 200
    assert response.json() == EXPECTED_PRODUCTS


def test_prices_are_positive_integer_centavos(client):
    products = client.get("/api/products").json()

    assert all(type(product["price"]) is int and product["price"] > 0 for product in products)


def test_product_ids_are_unique(client):
    ids = [product["id"] for product in client.get("/api/products").json()]

    assert len(ids) == len(set(ids))


def test_categories_match_the_kiosk_tabs(client):
    categories = {product["category"] for product in client.get("/api/products").json()}

    assert categories == {"Drinks", "Food", "Snacks"}
