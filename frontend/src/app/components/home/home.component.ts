import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  cart = inject(CartService);

  allProducts: Product[] = [];
  categories: string[] = ['All'];
  activeCategory = 'All';
  searchQuery = '';
  selectedProduct: Product | null = null;
  drawerQty = 1;
  toastVisible = false;
  toastMessage = '';
  loading = true;
  error = '';
  readonly skeletons = [1,2,3,4,5,6,7,8];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => { this.allProducts = products; this.loading = false; },
      error: () => { this.error = 'Failed to load products.'; this.loading = false; }
    });
    this.productService.getCategories().subscribe({
      next: cats => this.categories = ['All', ...cats],
      error: () => {}
    });
  }

  get filtered(): Product[] {
    let list = this.activeCategory === 'All'
      ? this.allProducts
      : this.allProducts.filter(p => p.category === this.activeCategory);
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  clearSearch(): void { this.searchQuery = ''; }

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

  incrementQty(): void { this.drawerQty++; }
  decrementQty(): void { if (this.drawerQty > 1) this.drawerQty--; }

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
