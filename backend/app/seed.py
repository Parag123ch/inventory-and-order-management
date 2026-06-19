from decimal import Decimal

from sqlalchemy.orm import Session

from .business import calculate_order_total
from .models import Customer, Order, OrderItem, Product


DEMO_PRODUCTS = [
    {"name": "Wireless Barcode Scanner", "sku": "SCAN-WL-100", "price": Decimal("89.99"), "quantity_in_stock": 18},
    {"name": "Thermal Label Printer", "sku": "PRN-LBL-200", "price": Decimal("149.50"), "quantity_in_stock": 7},
    {"name": "Shipping Labels 4x6", "sku": "LBL-4X6-500", "price": Decimal("24.75"), "quantity_in_stock": 42},
    {"name": "Packing Tape Roll", "sku": "PACK-TAPE-48", "price": Decimal("3.99"), "quantity_in_stock": 10},
    {"name": "Inventory Shelf Bin", "sku": "BIN-SHELF-12", "price": Decimal("11.25"), "quantity_in_stock": 6},
]

DEMO_CUSTOMERS = [
    {"full_name": "Avery Retail Co.", "email": "orders@averyretail.example", "phone": "+1-555-0101"},
    {"full_name": "Northstar Supplies", "email": "purchasing@northstar.example", "phone": "+1-555-0102"},
    {"full_name": "Metro Warehouse", "email": "ops@metrowarehouse.example", "phone": "+1-555-0103"},
]

DEMO_ORDERS = [
    {
        "customer_email": "orders@averyretail.example",
        "items": [
            {"sku": "SCAN-WL-100", "quantity": 2},
            {"sku": "LBL-4X6-500", "quantity": 5},
        ],
    },
    {
        "customer_email": "purchasing@northstar.example",
        "items": [
            {"sku": "PRN-LBL-200", "quantity": 1},
            {"sku": "PACK-TAPE-48", "quantity": 6},
        ],
    },
    {
        "customer_email": "ops@metrowarehouse.example",
        "items": [
            {"sku": "BIN-SHELF-12", "quantity": 3},
            {"sku": "PACK-TAPE-48", "quantity": 2},
        ],
    },
]


def seed_demo_data(db: Session) -> None:
    if db.query(Product).count() or db.query(Customer).count() or db.query(Order).count():
        return

    products = {payload["sku"]: Product(**payload) for payload in DEMO_PRODUCTS}
    customers = {payload["email"]: Customer(**payload) for payload in DEMO_CUSTOMERS}
    db.add_all([*products.values(), *customers.values()])
    db.flush()

    for order_payload in DEMO_ORDERS:
        customer = customers[order_payload["customer_email"]]
        order_lines = []
        for item in order_payload["items"]:
            product = products[item["sku"]]
            order_lines.append(
                {
                    "product_id": product.id,
                    "quantity": item["quantity"],
                    "unit_price": product.price,
                    "product": product,
                }
            )

        total = calculate_order_total(order_lines)
        order = Order(customer_id=customer.id, total_amount=total)
        db.add(order)
        db.flush()

        for line in order_lines:
            product = line["product"]
            product.quantity_in_stock -= line["quantity"]
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=line["quantity"],
                    unit_price=product.price,
                    line_total=Decimal(str(product.price)) * line["quantity"],
                )
            )

    db.commit()
