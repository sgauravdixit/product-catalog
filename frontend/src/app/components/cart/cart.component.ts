import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart = inject(CartService);

  get shipping(): number {
    return this.cart.subtotal() >= 50 ? 0 : 5.99;
  }

  get total(): number {
    return this.cart.subtotal() + this.shipping;
  }

  updateQty(productId: number, qty: number): void {
    this.cart.updateQuantity(productId, qty);
  }

  remove(productId: number): void {
    this.cart.removeFromCart(productId);
  }
}
