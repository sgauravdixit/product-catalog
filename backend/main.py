import hashlib
from typing import Optional

import pyodbc
from database import get_connection
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Product Catalog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "https://black-meadow-05d967c0f.7.azurestaticapps.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _product_row(row) -> dict:
    return {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "price": float(row[3]),
        "stock": row[4],
        "image_url": row[5],
        "category_id": row[6],
        "category_name": row[7],
    }


def _user_row(row) -> dict:
    return {
        "id": row[0],
        "full_name": row[1],
        "email": row[2],
        "phone": row[3],
        "address_line1": row[4],
        "address_line2": row[5],
        "city": row[6],
        "state": row[7],
        "zip_code": row[8],
    }


_PRODUCT_SELECT = """
    SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
           p.category_id, c.name AS category_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
"""

_USER_SELECT = """
    SELECT id, full_name, email, phone,
           address_line1, address_line2, city, state, zip_code
    FROM Users
"""


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@app.get("/products")
async def get_products():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(_PRODUCT_SELECT)
        return [_product_row(r) for r in cursor.fetchall()]
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# NOTE: /products/category/{name} must be defined before /products/{id}
# so FastAPI doesn't try to coerce "category" as an integer id.
@app.get("/products/category/{name}")
async def get_products_by_category(name: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(_PRODUCT_SELECT + " WHERE c.name = ?", name)
        return [_product_row(r) for r in cursor.fetchall()]
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/products/{product_id}")
async def get_product(product_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(_PRODUCT_SELECT + " WHERE p.id = ?", product_id)
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        return _product_row(row)
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/categories")
async def get_categories():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM Categories ORDER BY name")
        return [{"id": r[0], "name": r[1]} for r in cursor.fetchall()]
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.post("/users/register", status_code=201)
async def register_user(user: UserRegister):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Users WHERE email = ?", user.email)
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor.execute(
            """
            INSERT INTO Users (full_name, email, password_hash, phone)
            OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email, INSERTED.phone
            VALUES (?, ?, ?, ?)
            """,
            user.full_name, user.email, _hash(user.password), user.phone,
        )
        row = cursor.fetchone()
        conn.commit()
        return {"id": row[0], "full_name": row[1], "email": row[2], "phone": row[3]}
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/users/login")
async def login_user(credentials: UserLogin):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            _USER_SELECT + " WHERE email = ? AND password_hash = ?",
            credentials.email, _hash(credentials.password),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return _user_row(row)
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(_USER_SELECT + " WHERE id = ?", user_id)
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return _user_row(row)
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Users WHERE id = ?", user_id)
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        cursor.execute(
            """
            UPDATE Users SET
                full_name    = COALESCE(?, full_name),
                phone        = COALESCE(?, phone),
                address_line1 = COALESCE(?, address_line1),
                address_line2 = COALESCE(?, address_line2),
                city         = COALESCE(?, city),
                state        = COALESCE(?, state),
                zip_code     = COALESCE(?, zip_code)
            WHERE id = ?
            """,
            user.full_name, user.phone, user.address_line1, user.address_line2,
            user.city, user.state, user.zip_code, user_id,
        )
        conn.commit()
        cursor.execute(_USER_SELECT + " WHERE id = ?", user_id)
        return _user_row(cursor.fetchone())
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------

@app.get("/cart/{user_id}")
async def get_cart(user_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Cart WHERE user_id = ?", user_id)
        cart = cursor.fetchone()
        if not cart:
            return {"cart_id": None, "user_id": user_id, "items": [], "total": 0.0}
        cart_id = cart[0]
        cursor.execute(
            """
            SELECT ci.id, ci.product_id, ci.quantity,
                   p.name, p.price, p.image_url
            FROM Cart_Items ci
            JOIN Products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            """,
            cart_id,
        )
        items = [
            {
                "item_id": r[0],
                "product_id": r[1],
                "quantity": r[2],
                "name": r[3],
                "price": float(r[4]),
                "image_url": r[5],
                "subtotal": round(float(r[4]) * r[2], 2),
            }
            for r in cursor.fetchall()
        ]
        total = round(sum(i["subtotal"] for i in items), 2)
        return {"cart_id": cart_id, "user_id": user_id, "items": items, "total": total}
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/cart/{user_id}/items", status_code=201)
async def add_to_cart(user_id: int, item: CartItemAdd):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Cart WHERE user_id = ?", user_id)
        cart = cursor.fetchone()
        if not cart:
            cursor.execute(
                "INSERT INTO Cart (user_id) OUTPUT INSERTED.id VALUES (?)", user_id
            )
            cart_id = cursor.fetchone()[0]
        else:
            cart_id = cart[0]

        cursor.execute(
            "SELECT id FROM Cart_Items WHERE cart_id = ? AND product_id = ?",
            cart_id, item.product_id,
        )
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE Cart_Items SET quantity = quantity + ? WHERE id = ?",
                item.quantity, existing[0],
            )
        else:
            cursor.execute(
                "INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                cart_id, item.product_id, item.quantity,
            )
        conn.commit()
        return {"message": "Item added to cart", "cart_id": cart_id}
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# NOTE: /cart/items/{item_id} must be defined before /cart/{user_id}
# so the literal segment "items" is matched before the integer user_id param.
@app.put("/cart/items/{item_id}")
async def update_cart_item(item_id: int, update: CartItemUpdate):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Cart_Items WHERE id = ?", item_id)
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cart item not found")
        cursor.execute(
            "UPDATE Cart_Items SET quantity = ? WHERE id = ?",
            update.quantity, item_id,
        )
        conn.commit()
        return {"message": "Cart item updated"}
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/cart/items/{item_id}", status_code=204)
async def remove_cart_item(item_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Cart_Items WHERE id = ?", item_id)
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cart item not found")
        cursor.execute("DELETE FROM Cart_Items WHERE id = ?", item_id)
        conn.commit()
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/cart/{user_id}", status_code=204)
async def clear_cart(user_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM Cart WHERE user_id = ?", user_id)
        cart = cursor.fetchone()
        if cart:
            cursor.execute("DELETE FROM Cart_Items WHERE cart_id = ?", cart[0])
            conn.commit()
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

# NOTE: /orders/detail/{order_id} must be defined before /orders/{user_id}
# to avoid "detail" being interpreted as an integer user_id.
@app.get("/orders/detail/{order_id}")
async def get_order_detail(order_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, user_id, total_amount, shipping_address, status, created_at"
            " FROM Orders WHERE id = ?",
            order_id,
        )
        order = cursor.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        cursor.execute(
            """
            SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price,
                   p.name, p.image_url
            FROM Order_Items oi
            JOIN Products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            """,
            order_id,
        )
        items = [
            {
                "id": r[0],
                "product_id": r[1],
                "quantity": r[2],
                "unit_price": float(r[3]),
                "name": r[4],
                "image_url": r[5],
                "subtotal": round(float(r[3]) * r[2], 2),
            }
            for r in cursor.fetchall()
        ]
        return {
            "id": order[0],
            "user_id": order[1],
            "total_amount": float(order[2]),
            "shipping_address": order[3],
            "status": order[4],
            "created_at": order[5].isoformat() if order[5] else None,
            "items": items,
        }
    except HTTPException:
        raise
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/orders/{user_id}")
async def get_user_orders(user_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, total_amount, shipping_address, status, created_at"
            " FROM Orders WHERE user_id = ? ORDER BY created_at DESC",
            user_id,
        )
        return [
            {
                "id": r[0],
                "total_amount": float(r[1]),
                "shipping_address": r[2],
                "status": r[3],
                "created_at": r[4].isoformat() if r[4] else None,
            }
            for r in cursor.fetchall()
        ]
    except pyodbc.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/orders/{user_id}", status_code=201)
async def create_order(user_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT address_line1, address_line2, city, state, zip_code"
            " FROM Users WHERE id = ?",
            user_id,
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("SELECT id FROM Cart WHERE user_id = ?", user_id)
        cart = cursor.fetchone()
        if not cart:
            raise HTTPException(status_code=400, detail="Cart is empty")
        cart_id = cart[0]

        cursor.execute(
            """
            SELECT ci.product_id, ci.quantity, p.price
            FROM Cart_Items ci
            JOIN Products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            """,
            cart_id,
        )
        cart_items = cursor.fetchall()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total = round(sum(float(r[2]) * r[1] for r in cart_items), 2)
        addr_parts = [p for p in [user[0], user[1], user[2], user[3], user[4]] if p]
        shipping_address = ", ".join(addr_parts)

        cursor.execute(
            """
            INSERT INTO Orders (user_id, total_amount, shipping_address, status)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, 'pending')
            """,
            user_id, total, shipping_address,
        )
        order_id = cursor.fetchone()[0]

        for product_id, quantity, price in cart_items:
            cursor.execute(
                "INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)"
                " VALUES (?, ?, ?, ?)",
                order_id, product_id, quantity, float(price),
            )

        cursor.execute("DELETE FROM Cart_Items WHERE cart_id = ?", cart_id)
        conn.commit()

        return {"message": "Order placed successfully", "order_id": order_id, "total": total}
    except HTTPException:
        raise
    except pyodbc.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
