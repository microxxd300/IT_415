"""Pure price and payment math. All money is integer centavos (4500 = ₱45.00); no float math."""

from collections.abc import Iterable, Mapping

MAX_QUANTITY = 99  # per product, so one tap-happy customer cannot create a huge order


class PricingError(ValueError):
    """The order or payment is invalid; the message is shown to the customer."""


class InsufficientPaymentError(PricingError):
    pass


def format_peso(centavos: int) -> str:
    sign = "-" if centavos < 0 else ""
    pesos, cents = divmod(abs(centavos), 100)
    return f"{sign}₱{pesos:,}.{cents:02d}"


def build_lines(items: Iterable[Mapping], products_by_id: Mapping[int, Mapping]) -> list[dict]:
    """Turn requested {product_id, quantity} items into priced lines, using the server's own prices.

    The same product requested twice becomes one line, in the order products were first requested.
    """
    quantities: dict[int, int] = {}
    for item in items:
        product_id = item["product_id"]
        if product_id not in products_by_id:
            raise PricingError(f"Product {product_id} does not exist.")
        quantities[product_id] = quantities.get(product_id, 0) + item["quantity"]

    lines = []
    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        if quantity > MAX_QUANTITY:
            raise PricingError(f"You can order at most {MAX_QUANTITY} of {product['name']}.")
        lines.append(
            {
                "product_id": product_id,
                "name": product["name"],
                "unit_price": product["price"],
                "quantity": quantity,
                "subtotal": product["price"] * quantity,  # Subtotal = unit price × quantity
            }
        )
    return lines


def calculate_total(lines: Iterable[Mapping]) -> int:
    """Total = sum of all subtotals."""
    return sum(line["subtotal"] for line in lines)


def validate_cash(amount_paid: int, total: int) -> None:
    if amount_paid < total:
        raise InsufficientPaymentError(
            f"Insufficient payment. Please enter at least {format_peso(total)}. "
            f"You are short by {format_peso(total - amount_paid)}."
        )


def compute_change(amount_paid: int, total: int) -> int:
    """Change = amount paid − total. Call validate_cash first."""
    return amount_paid - total
