import pytest

from app.services.pricing import (
    MAX_QUANTITY,
    InsufficientPaymentError,
    PricingError,
    build_lines,
    calculate_total,
    compute_change,
    format_peso,
    validate_cash,
)
from app.store import PRODUCTS

PRODUCTS_BY_ID = {product["id"]: product for product in PRODUCTS}
COFFEE, SANDWICH, SOFT_DRINK = 1, 2, 3


def total_for(*items):
    return calculate_total(build_lines([{"product_id": p, "quantity": q} for p, q in items], PRODUCTS_BY_ID))


# ---------- format_peso ----------


@pytest.mark.parametrize(
    ("centavos", "text"),
    [(0, "₱0.00"), (5, "₱0.05"), (4500, "₱45.00"), (17500, "₱175.00"), (123456, "₱1,234.56"), (-4000, "-₱40.00")],
)
def test_format_peso(centavos, text):
    assert format_peso(centavos) == text


# ---------- order totals (acceptance 1–3) ----------


def test_lines_use_server_prices_and_subtotals():
    lines = build_lines(
        [{"product_id": COFFEE, "quantity": 2}, {"product_id": SANDWICH, "quantity": 1}], PRODUCTS_BY_ID
    )

    assert lines == [
        {"product_id": 1, "name": "Coffee", "unit_price": 4500, "quantity": 2, "subtotal": 9000},
        {"product_id": 2, "name": "Sandwich", "unit_price": 5000, "quantity": 1, "subtotal": 5000},
    ]


def test_totals_175_then_220_then_140():
    assert total_for((COFFEE, 2), (SANDWICH, 1), (SOFT_DRINK, 1)) == 17500
    assert total_for((COFFEE, 3), (SANDWICH, 1), (SOFT_DRINK, 1)) == 22000
    assert total_for((COFFEE, 2), (SANDWICH, 1)) == 14000


def test_same_product_twice_becomes_one_line():
    lines = build_lines(
        [{"product_id": COFFEE, "quantity": 1}, {"product_id": SANDWICH, "quantity": 1}, {"product_id": COFFEE, "quantity": 2}],
        PRODUCTS_BY_ID,
    )

    assert [(line["name"], line["quantity"], line["subtotal"]) for line in lines] == [
        ("Coffee", 3, 13500),
        ("Sandwich", 1, 5000),
    ]


def test_unknown_product_is_rejected():
    with pytest.raises(PricingError, match="Product 999 does not exist."):
        build_lines([{"product_id": 999, "quantity": 1}], PRODUCTS_BY_ID)


def test_quantity_above_the_maximum_is_rejected():
    with pytest.raises(PricingError, match=f"You can order at most {MAX_QUANTITY} of Coffee."):
        build_lines([{"product_id": COFFEE, "quantity": 60}, {"product_id": COFFEE, "quantity": 40}], PRODUCTS_BY_ID)


def test_quantity_at_the_maximum_is_allowed():
    assert total_for((COFFEE, MAX_QUANTITY)) == 4500 * MAX_QUANTITY


# ---------- cash payment (acceptance 4–5) ----------


def test_insufficient_cash_is_rejected_with_exact_message():
    with pytest.raises(InsufficientPaymentError) as error:
        validate_cash(amount_paid=10000, total=14000)

    assert str(error.value) == "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00."


def test_200_on_140_gives_60_change():
    validate_cash(amount_paid=20000, total=14000)

    assert compute_change(amount_paid=20000, total=14000) == 6000


def test_exact_payment_gives_zero_change():
    validate_cash(amount_paid=14000, total=14000)

    assert compute_change(amount_paid=14000, total=14000) == 0


def test_one_centavo_short_is_rejected():
    with pytest.raises(InsufficientPaymentError, match="You are short by ₱0.01."):
        validate_cash(amount_paid=13999, total=14000)
