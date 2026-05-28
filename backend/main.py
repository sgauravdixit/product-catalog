import hashlib
import logging
from typing import Optional

from database import get_connection
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    try:
        conn = get_connection()
        conn.cursor().execute("SELECT 1")
        conn.close()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error("Health check failed: %s", e)
        return {"status": "error", "database": "disconnected", "detail": str(e)}


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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/orders/{user_id}")
async def get_user_orders(user_id: int):
    logger.info("GET /orders/%s — fetching orders with items", user_id)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, total_amount, shipping_address, status, created_at"
            " FROM Orders WHERE user_id = ? ORDER BY created_at DESC",
            user_id,
        )
        orders = cursor.fetchall()
        logger.info("Found %d orders for user %s", len(orders), user_id)
        result = []
        for order in orders:
            order_id = order[0]
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
            result.append({
                "id": order[0],
                "total_amount": float(order[1]),
                "shipping_address": order[2],
                "status": order[3],
                "created_at": order[4].isoformat() if order[4] else None,
                "items": items,
            })
        return result
    except Exception as e:
        logger.error("Error fetching orders for user %s: %s", user_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/orders/{user_id}", status_code=201)
async def create_order(user_id: int):
    logger.info("POST /orders/%s — starting order creation", user_id)
    conn = get_connection()
    try:
        cursor = conn.cursor()

        logger.info("Fetching shipping address for user %s", user_id)
        cursor.execute(
            "SELECT address_line1, address_line2, city, state, zip_code"
            " FROM Users WHERE id = ?",
            user_id,
        )
        user = cursor.fetchone()
        if not user:
            logger.warning("User %s not found", user_id)
            raise HTTPException(status_code=404, detail="User not found")

        logger.info("Fetching cart for user %s", user_id)
        cursor.execute("SELECT id FROM Cart WHERE user_id = ?", user_id)
        cart = cursor.fetchone()
        if not cart:
            logger.warning("No cart row found for user %s", user_id)
            raise HTTPException(status_code=400, detail="Cart is empty")
        cart_id = cart[0]
        logger.info("Found cart_id=%s for user %s", cart_id, user_id)

        logger.info("Fetching cart items for cart_id=%s", cart_id)
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
            logger.warning("Cart %s has no items for user %s", cart_id, user_id)
            raise HTTPException(status_code=400, detail="Cart is empty")
        logger.info("Cart %s has %d items", cart_id, len(cart_items))

        total = round(sum(float(r[2]) * r[1] for r in cart_items), 2)
        addr_parts = [p for p in [user[0], user[1], user[2], user[3], user[4]] if p]
        shipping_address = ", ".join(addr_parts) if addr_parts else "No address on file"
        logger.info("Order total=%.2f, shipping_address=%r", total, shipping_address)

        logger.info("Inserting Orders row for user %s", user_id)
        cursor.execute(
            """
            INSERT INTO Orders (user_id, total_amount, shipping_address, status)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, 'pending')
            """,
            user_id, total, shipping_address,
        )
        order_row = cursor.fetchone()
        if not order_row:
            raise RuntimeError("INSERT into Orders returned no id")
        order_id = order_row[0]
        logger.info("Created order_id=%s", order_id)

        logger.info("Inserting %d Order_Items rows", len(cart_items))
        for product_id, quantity, price in cart_items:
            logger.info("  Order_Item: order=%s product=%s qty=%s price=%s",
                        order_id, product_id, quantity, float(price))
            cursor.execute(
                "INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)"
                " VALUES (?, ?, ?, ?)",
                order_id, product_id, quantity, float(price),
            )

        logger.info("Clearing Cart_Items for cart_id=%s", cart_id)
        cursor.execute("DELETE FROM Cart_Items WHERE cart_id = ?", cart_id)

        logger.info("Committing transaction for order_id=%s", order_id)
        conn.commit()
        logger.info("Order %s committed successfully, total=%.2f", order_id, total)

        return {"message": "Order placed successfully", "order_id": order_id, "total": total}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error creating order for user %s: %s", user_id, e, exc_info=True)
        try:
            conn.rollback()
            logger.info("Rolled back transaction for user %s", user_id)
        except Exception as rb_err:
            logger.error("Rollback also failed: %s", rb_err)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
