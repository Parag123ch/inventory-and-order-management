import unittest
from decimal import Decimal

from app.business import calculate_order_total, reduce_inventory


class BusinessLogicTests(unittest.TestCase):
    def test_calculate_order_total(self):
        total = calculate_order_total(
            [
                {"product_id": 1, "quantity": 2, "unit_price": "12.50"},
                {"product_id": 2, "quantity": 3, "unit_price": Decimal("4.00")},
            ]
        )
        self.assertEqual(total, Decimal("37.00"))

    def test_reduce_inventory_combines_duplicate_product_lines(self):
        updated = reduce_inventory(
            {1: 10, 2: 5},
            [
                {"product_id": 1, "quantity": 3},
                {"product_id": 1, "quantity": 4},
                {"product_id": 2, "quantity": 1},
            ],
        )
        self.assertEqual(updated, {1: 3, 2: 4})

    def test_reduce_inventory_rejects_insufficient_stock(self):
        with self.assertRaisesRegex(ValueError, "Insufficient inventory"):
            reduce_inventory({1: 2}, [{"product_id": 1, "quantity": 3}])


if __name__ == "__main__":
    unittest.main()
