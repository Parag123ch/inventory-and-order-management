from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, condecimal, conint


Price = condecimal(max_digits=10, decimal_places=2, gt=0)


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    sku: str = Field(..., min_length=1, max_length=64)
    price: Price
    quantity_in_stock: conint(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    sku: str | None = Field(None, min_length=1, max_length=64)
    price: Price | None = None
    quantity_in_stock: conint(ge=0) | None = None


class ProductRead(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=160)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=40)


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: conint(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductRead]
