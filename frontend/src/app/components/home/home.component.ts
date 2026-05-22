import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private productService = inject(ProductService);
  cart = inject(CartService);

  allProducts = this.productService.getAll();
  categories = ['All', ...this.productService.getCategories()];
  activeCategory = 'All';
  selectedProduct: Product | null = null;
  drawerQty = 1;
  toastVisible = false;
  toastMessage = '';

  get filtered(): Product[] {
    if (this.activeCategory === 'All') return this.allProducts;
    return this.allProducts.filter(p => p.category === this.activeCategory);
  }

  cardClass(i: number): string {
    const c = ['', 'gs-pcard--mint', 'gs-pcard--blush'];
    return c[i % 3];
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
  }

  openDrawer(product: Product): void {
    this.selectedProduct = product;
    this.drawerQty = 1;
    document.body.style.overflow = 'hidden';
  }

  closeDrawer(): void {
    this.selectedProduct = null;
    document.body.style.overflow = '';
  }

  incrementQty(): void {
    this.drawerQty++;
  }

  decrementQty(): void {
    if (this.drawerQty > 1) this.drawerQty--;
  }

  addToCartFromDrawer(): void {
    if (!this.selectedProduct) return;
    this.cart.addToCart(this.selectedProduct, this.drawerQty);
    this.showToast(`${this.selectedProduct.name} added to cart!`);
  }

  addToCartDirect(product: Product): void {
    this.cart.addToCart(product, 1);
    this.showToast(`${product.name} added to cart!`);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2200);
  }
}
