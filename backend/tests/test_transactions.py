import re

import pytest

from app.store import transaction_count

COFFEE, SANDWICH, SOFT_DRINK = 1, 2, 3
ORDER_140 = [{"product_id": COFFEE, "quantity": 2}, {"product_id": SANDWICH, "quantity": 1}]  # ₱90 + ₱50
REFERENCE_PATTERN = re.compile(r"^TXN-\d{8}-\d{6}-\d{3}$")


def pay(client, method, amount_paid=None, items=ORDER_140):
    body = {"items": items, "payment_method": method}
    if amount_paid is not None:
        body["amount_paid"] = amount_paid
    return client.post("/api/transactions", json=body)


# ---------- successful payments ----------


def test_cash_200_on_140_gives_60_change(client):
    response = pay(client, "cash", amount_paid=20000)

    assert response.status_code == 201
    receipt = response.json()
    assert REFERENCE_PATTERN.match(receipt["reference"])
    assert receipt["items"] == [
        {"product_id": 1, "name": "Coffee", "unit_price": 4500, "quantity": 2, "subtotal": 9000},
        {"product_id": 2, "name": "Sandwich", "unit_price": 5000, "quantity": 1, "subtotal": 5000},
    ]
    assert receipt["total"] == 14000
    assert receipt["payment_method"] == "cash"
    assert receipt["payment_method_label"] == "Cash"
    assert receipt["amount_paid"] == 20000
    assert receipt["change"] == 6000
    assert receipt["status"] == "Payment Successful"
    assert receipt["created_at"]


def test_exact_cash_gives_zero_change(client):
    receipt = pay(client, "cash", amount_paid=14000).json()

    assert receipt["amount_paid"] == 14000
    assert receipt["change"] == 0


@pytest.mark.parametrize(("method", "label"), [("qr", "QR Payment"), ("card", "Credit/Debit Card")])
def test_qr_and_card_pay_exactly_the_total(client, method, label):
    response = pay(client, method, amount_paid=999999)  # ignored for qr and card

    assert response.status_code == 201
    receipt = response.json()
    assert receipt["payment_method_label"] == label
    assert receipt["amount_paid"] == receipt["total"] == 14000
    assert receipt["change"] == 0


def test_client_prices_are_ignored(client):
    items = [{"product_id": COFFEE, "quantity": 1, "price": 1, "unit_price": 1}]

    receipt = pay(client, "qr", items=items).json()

    assert receipt["items"][0]["unit_price"] == 4500
    assert receipt["total"] == 4500


# ---------- rejected payments save nothing ----------


def test_insufficient_cash_is_rejected_and_nothing_is_saved(client):
    response = pay(client, "cash", amount_paid=10000)

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00."
    }
    assert transaction_count() == 0


@pytest.mark.parametrize(
    ("body", "detail"),
    [
        ({"items": [], "payment_method": "qr"}, "Your order must contain at least one item."),
        ({"payment_method": "qr"}, "Your order must contain at least one item."),
        ({"items": [{"product_id": 999, "quantity": 1}], "payment_method": "qr"}, "Product 999 does not exist."),
        ({"items": [{"product_id": 1, "quantity": 0}], "payment_method": "qr"}, "Quantity must be between 1 and 99."),
        ({"items": [{"product_id": 1, "quantity": 100}], "payment_method": "qr"}, "Quantity must be between 1 and 99."),
        ({"items": [{"product_id": 1, "quantity": "2"}], "payment_method": "qr"}, "Quantity must be between 1 and 99."),
        ({"items": ORDER_140, "payment_method": "bitcoin"}, "Please choose Cash, QR Payment or Credit/Debit Card."),
        ({"items": ORDER_140, "payment_method": "cash"}, "Please enter the amount paid for a cash payment."),
        ({"items": ORDER_140, "payment_method": "cash", "amount_paid": -100}, "Amount paid cannot be negative."),
        ({"items": ORDER_140, "payment_method": "cash", "amount_paid": "abc"}, "Please enter a valid amount paid."),
        ({"items": ORDER_140, "payment_method": "cash", "amount_paid": 200.5}, "Please enter a valid amount paid."),
    ],
)
def test_invalid_requests_return_422_with_a_clear_message(client, body, detail):
    response = client.post("/api/transactions", json=body)

    assert response.status_code == 422
    assert response.json() == {"detail": detail}
    assert transaction_count() == 0


def test_more_than_99_of_one_product_across_lines_is_rejected(client):
    items = [{"product_id": COFFEE, "quantity": 60}, {"product_id": COFFEE, "quantity": 40}]

    response = pay(client, "qr", items=items)

    assert response.status_code == 422
    assert response.json() == {"detail": "You can order at most 99 of Coffee."}
    assert transaction_count() == 0


# ---------- references ----------


def test_each_transaction_gets_a_different_reference(client):
    first = pay(client, "cash", amount_paid=20000).json()["reference"]
    second = pay(client, "qr").json()["reference"]

    assert first != second
    assert first.endswith("-001")
    assert second.endswith("-002")
    assert transaction_count() == 2


# ---------- GET /api/transactions/{reference} ----------


def test_receipt_can_be_looked_up_by_reference(client):
    created = pay(client, "cash", amount_paid=20000).json()

    response = client.get(f"/api/transactions/{created['reference']}")

    assert response.status_code == 200
    assert response.json() == created


def test_unknown_reference_returns_404(client):
    response = client.get("/api/transactions/TXN-20260101-000000-999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Transaction not found."}


# ---------- acceptance tests 4–7, end to end ----------


def test_acceptance_4_insufficient_cash_gives_no_receipt(client):
    response = pay(client, "cash", amount_paid=10000)

    assert response.status_code == 400
    assert "reference" not in response.json()
    assert transaction_count() == 0


def test_acceptance_5_cash_receipt_matches_the_payment(client):
    reference = pay(client, "cash", amount_paid=20000).json()["reference"]

    receipt = client.get(f"/api/transactions/{reference}").json()

    assert [(line["name"], line["quantity"], line["subtotal"]) for line in receipt["items"]] == [
        ("Coffee", 2, 9000),
        ("Sandwich", 1, 5000),
    ]
    assert (receipt["total"], receipt["amount_paid"], receipt["change"]) == (14000, 20000, 6000)
    assert receipt["payment_method_label"] == "Cash"
    assert receipt["status"] == "Payment Successful"

    exact = pay(client, "cash", amount_paid=14000).json()
    assert exact["change"] == 0


@pytest.mark.parametrize(("method", "label"), [("qr", "QR Payment"), ("card", "Credit/Debit Card")])
def test_acceptance_6_qr_and_card_receipts(client, method, label):
    reference = pay(client, method).json()["reference"]

    receipt = client.get(f"/api/transactions/{reference}").json()

    assert receipt["payment_method_label"] == label
    assert receipt["amount_paid"] == receipt["total"] == 14000
    assert receipt["change"] == 0


def test_acceptance_7_two_transactions_have_their_own_receipts(client):
    cash = pay(client, "cash", amount_paid=20000).json()
    card = pay(client, "card", items=[{"product_id": SOFT_DRINK, "quantity": 1}]).json()

    assert cash["reference"] != card["reference"]
    assert client.get(f"/api/transactions/{cash['reference']}").json()["total"] == 14000
    assert client.get(f"/api/transactions/{card['reference']}").json()["total"] == 3500
