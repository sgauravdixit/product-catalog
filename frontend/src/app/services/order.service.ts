import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { CartItem, LastOrder } from '../models/product.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ApiOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  name: string;
  image_url: string;
  subtotal: number;
}

export interface ApiOrder {
  id: number;
  total_amount: number;
  shipping_address: string;
  status: string;
  created_at: string;
  items?: ApiOrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = environment.apiUrl;

  private _lastOrder = signal<LastOrder | null>(null);
  readonly lastOrder = this._lastOrder.asReadonly();

  placeOrder(items: CartItem[], shipping: number, address: string): Observable<LastOrder> {
    const userId = this.auth.getUserId();
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    const localOrder: LastOrder = {
      items: [...items],
      subtotal,
      shipping,
      total: subtotal + shipping,
      orderNumber: 'SM-' + Date.now().toString(36).toUpperCase().slice(-6),
      orderDate: new Date(),
      address
    };

    if (!userId) {
      this._lastOrder.set(localOrder);
      return of(localOrder);
    }

    return this.http.post<{ order_id: number; total: number; message: string }>(`${this.base}/orders/${userId}`, {}).pipe(
      map(res => {
        const order: LastOrder = {
          ...localOrder,
          orderNumber: 'SM-' + res.order_id.toString().padStart(6, '0'),
          total: res.total,
          subtotal: res.total - shipping
        };
        this._lastOrder.set(order);
        return order;
      }),
      catchError(() => {
        this._lastOrder.set(localOrder);
        return of(localOrder);
      })
    );
  }

  getUserOrders(userId: number): Observable<ApiOrder[]> {
    return this.http.get<ApiOrder[]>(`${this.base}/orders/${userId}`);
  }
}
