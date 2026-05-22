import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private productService = inject(ProductService);
  cart = inject(CartService);

  query = '';
  results: Product[] = [];
  allProducts: Product[] = [];
  searched = false;
  toastVisible = false;

  suggestions = ['Headphones', 'Laptop', 'Jacket', 'Books', 'Coffee'];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => this.allProducts = products,
      error: () => {}
    });
  }

  cardClass(i: number): string {
    const c = ['', 'gs-pcard--mint', 'gs-pcard--blush'];
    return c[i % 3];
  }

  doSearch(): void {
    const q = this.query.toLowerCase().trim();
    this.results = q
      ? this.allProducts.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        )
      : [];
    this.searched = true;
  }

  clearSearch(): void {
    this.query = '';
    this.results = [];
    this.searched = false;
  }

  useSuggestion(s: string): void {
    this.query = s;
    this.doSearch();
  }

  addToCart(product: Product): void {
    this.cart.addToCart(product, 1);
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2200);
  }
}
