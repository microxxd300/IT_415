"""In-memory data for the kiosk. No database: data lives only while the server runs."""

# Prices are integer centavos: 4500 = ₱45.00.
PRODUCTS = [
    {"id": 1, "name": "Coffee", "price": 4500, "category": "Drinks"},
    {"id": 2, "name": "Sandwich", "price": 5000, "category": "Food"},
    {"id": 3, "name": "Soft Drink", "price": 3500, "category": "Drinks"},
    {"id": 4, "name": "Cookies", "price": 2500, "category": "Snacks"},
    {"id": 5, "name": "Bottled Water", "price": 2000, "category": "Drinks"},
    {"id": 6, "name": "Chocolate", "price": 2500, "category": "Snacks"},
]
