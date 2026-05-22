import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private productService = inject(ProductService);

  featured: Product[] = this.productService.getAll().slice(0, 4);

  categories = [
    { name: 'Electronics', count: this.productService.getCountByCategory('Electronics'), color: '' },
    { name: 'Clothing',    count: this.productService.getCountByCategory('Clothing'),    color: 'gs-cat--mint' },
    { name: 'Home & Kitchen', count: this.productService.getCountByCategory('Home & Kitchen'), color: 'gs-cat--blush' },
    { name: 'Books',       count: this.productService.getCountByCategory('Books'),       color: '' },
  ];

  cardClass(i: number): string {
    const c = ['', 'gs-pcard--mint', 'gs-pcard--blush'];
    return c[i % 3];
  }

  marqueeItems = [
    'FREE SHIPPING OVER $50', 'NEW ARRIVALS WEEKLY', 'TOP GLOBAL BRANDS',
    'EASY 30-DAY RETURNS', 'SECURE CHECKOUT', '50,000+ HAPPY CUSTOMERS',
    'FREE SHIPPING OVER $50', 'NEW ARRIVALS WEEKLY', 'TOP GLOBAL BRANDS',
    'EASY 30-DAY RETURNS', 'SECURE CHECKOUT', '50,000+ HAPPY CUSTOMERS',
  ];
}
