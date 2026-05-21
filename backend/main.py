from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

app = FastAPI(title="Product Catalog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock: int
    description: str
    image_url: str


class Product(ProductCreate):
    id: str
    created_at: datetime


products: List[Product] = [
    Product(
        id=str(uuid.uuid4()),
        name="Wireless Headphones",
        category="Electronics",
        price=79.99,
        stock=50,
        description="Premium wireless headphones with active noise cancellation and 30-hour battery life.",
        image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        created_at=datetime.now(),
    ),
    Product(
        id=str(uuid.uuid4()),
        name="Running Shoes",
        category="Sports",
        price=129.99,
        stock=30,
        description="Lightweight and responsive running shoes designed for all-terrain performance.",
        image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        created_at=datetime.now(),
    ),
    Product(
        id=str(uuid.uuid4()),
        name="Coffee Maker",
        category="Kitchen",
        price=49.99,
        stock=20,
        description="12-cup automatic drip coffee maker with programmable timer and keep-warm plate.",
        image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
        created_at=datetime.now(),
    ),
    Product(
        id=str(uuid.uuid4()),
        name="Leather Wallet",
        category="Accessories",
        price=39.99,
        stock=100,
        description="Slim genuine leather bifold wallet with RFID blocking technology.",
        image_url="https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
        created_at=datetime.now(),
    ),
]


@app.get("/products", response_model=List[Product])
def get_products():
    return products


@app.post("/products", response_model=Product, status_code=201)
def create_product(product: ProductCreate):
    new_product = Product(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        **product.model_dump(),
    )
    products.append(new_product)
    return new_product


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: str):
    for i, p in enumerate(products):
        if p.id == product_id:
            products.pop(i)
            return
    raise HTTPException(status_code=404, detail="Product not found")
