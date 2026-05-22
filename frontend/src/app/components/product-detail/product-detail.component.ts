import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  cart = inject(CartService);

  product: Product | undefined;
  qty = 1;
  toastVisible = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.productService.getById(id);
  }

  increment(): void { this.qty++; }
  decrement(): void { if (this.qty > 1) this.qty--; }

  addToCart(): void {
    if (!this.product) return;
    this.cart.addToCart(this.product, this.qty);
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2200);
  }
}
