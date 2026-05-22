import { Injectable, signal } from '@angular/core';
import { CartItem, LastOrder } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private _lastOrder = signal<LastOrder | null>(null);
  readonly lastOrder = this._lastOrder.asReadonly();

  placeOrder(items: CartItem[], shipping: number, address: string): void {
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    this._lastOrder.set({
      items: [...items],
      subtotal,
      shipping,
      total: subtotal + shipping,
      orderNumber: 'SM-' + Date.now().toString(36).toUpperCase().slice(-6),
      orderDate: new Date(),
      address
    });
  }
}
