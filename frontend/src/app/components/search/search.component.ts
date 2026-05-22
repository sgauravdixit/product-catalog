import { Component, inject } from '@angular/core';
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
export class SearchComponent {
  private productService = inject(ProductService);
  cart = inject(CartService);

  query = '';
  results: Product[] = [];
  searched = false;
  toastVisible = false;

  suggestions = ['Headphones', 'Laptop', 'Jacket', 'Books', 'Coffee'];

  cardClass(i: number): string {
    const c = ['', 'gs-pcard--mint', 'gs-pcard--blush'];
    return c[i % 3];
  }

  doSearch(): void {
    this.results = this.productService.search(this.query);
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
