import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  private router = inject(Router);
  cart = inject(CartService);
  private orderService = inject(OrderService);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  city = '';
  zip = '';
  country = 'United States';

  shipping = 'standard';

  get shippingCost(): number {
    if (this.cart.subtotal() >= 50) return 0;
    return this.shipping === 'express' ? 14.99 : 5.99;
  }

  get total(): number {
    return this.cart.subtotal() + this.shippingCost;
  }

  confirmOrder(): void {
    const fullAddress = `${this.address || '123 Main St'}, ${this.city || 'New York'}, ${this.zip || '10001'}, ${this.country}`;
    this.orderService.placeOrder(this.cart.items(), this.shippingCost, fullAddress);
    this.cart.clearCart();
    this.router.navigate(['/confirmation']);
  }
}
