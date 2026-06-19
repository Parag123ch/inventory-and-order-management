from decimal import Decimal


def ensure_non_negative_quantity(quantity: int) -> None:
    if quantity < 0:
        raise ValueError("Product quantity cannot be negative.")


def calculate_order_total(items: list[dict]) -> Decimal:
    total = Decimal("0.00")
    for item in items:
        price = Decimal(str(item["unit_price"]))
        total += price * int(item["quantity"])
    return total.quantize(Decimal("0.01"))


def assert_inventory_available(stock_by_product_id: dict[int, int], order_items: list[dict]) -> None:
    requested: dict[int, int] = {}
    for item in order_items:
        product_id = int(item["product_id"])
        requested[product_id] = requested.get(product_id, 0) + int(item["quantity"])

    for product_id, quantity in requested.items():
        if stock_by_product_id.get(product_id, 0) < quantity:
            raise ValueError(f"Insufficient inventory for product {product_id}.")


def reduce_inventory(stock_by_product_id: dict[int, int], order_items: list[dict]) -> dict[int, int]:
    assert_inventory_available(stock_by_product_id, order_items)
    updated = dict(stock_by_product_id)
    for item in order_items:
        product_id = int(item["product_id"])
        updated[product_id] -= int(item["quantity"])
    return updated
