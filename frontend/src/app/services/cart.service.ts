import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, CartItem } from '../models/product.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface ApiCartItem {
  item_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  subtotal: number;
}

interface ApiCart {
  cart_id: number | null;
  user_id: number;
  items: ApiCartItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = environment.apiUrl;

  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  constructor() {
    if (this.auth.getUserId()) {
      this.loadCart();
    }
  }

  private toCartItem(a: ApiCartItem): CartItem {
    return {
      item_id: a.item_id,
      quantity: a.quantity,
      product: {
        id: a.product_id,
        name: a.name,
        price: a.price,
        image: a.image_url,
        category: '',
        description: '',
        stock: 0
      }
    };
  }

  loadCart(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.http.get<ApiCart>(`${this.base}/cart/${userId}`).subscribe({
      next: cart => this._items.set(cart.items.map(i => this.toCartItem(i))),
      error: () => {}
    });
  }

  addToCart(product: Product, quantity = 1): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this._items.update(items => {
        const idx = items.findIndex(i => i.product.id === product.id);
        if (idx >= 0) return items.map((item, i) => i === idx ? { ...item, quantity: item.quantity + quantity } : item);
        return [...items, { product, quantity }];
      });
      return;
    }
    // Optimistic update first
    this._items.update(items => {
      const idx = items.findIndex(i => i.product.id === product.id);
      if (idx >= 0) return items.map((item, i) => i === idx ? { ...item, quantity: item.quantity + quantity } : item);
      return [...items, { product, quantity }];
    });
    this.http.post(`${this.base}/cart/${userId}/items`, { product_id: product.id, quantity }).subscribe({
      next: () => this.loadCart(), // reload to sync item_ids
      error: () => {}
    });
  }

  removeFromCart(productId: number): void {
    const item = this._items().find(i => i.product.id === productId);
    if (!item) return;
    // Optimistic update
    this._items.update(items => items.filter(i => i.product.id !== productId));
    if (item.item_id) {
      this.http.delete(`${this.base}/cart/items/${item.item_id}`).subscribe({ error: () => this.loadCart() });
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) { this.removeFromCart(productId); return; }
    const item = this._items().find(i => i.product.id === productId);
    if (!item) return;
    // Optimistic update
    this._items.update(items => items.map(i => i.product.id === productId ? { ...i, quantity } : i));
    if (item.item_id) {
      this.http.put(`${this.base}/cart/items/${item.item_id}`, { quantity }).subscribe({ error: () => this.loadCart() });
    }
  }

  clearCart(): void {
    const userId = this.auth.getUserId();
    this._items.set([]);
    if (userId) {
      this.http.delete(`${this.base}/cart/${userId}`).subscribe({ error: () => {} });
    }
  }
}
