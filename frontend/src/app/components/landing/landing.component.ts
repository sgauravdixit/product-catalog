import { Component, inject, OnInit } from '@angular/core';
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
export class LandingComponent implements OnInit {
  private productService = inject(ProductService);

  featured: Product[] = [];

  categories = [
    { name: 'Electronics',   count: 0, color: '' },
    { name: 'Clothing',      count: 0, color: 'gs-cat--mint' },
    { name: 'Home & Kitchen',count: 0, color: 'gs-cat--blush' },
    { name: 'Books',         count: 0, color: '' },
  ];

  marqueeItems = [
    'FREE SHIPPING OVER $50', 'NEW ARRIVALS WEEKLY', 'TOP GLOBAL BRANDS',
    'EASY 30-DAY RETURNS', 'SECURE CHECKOUT', '50,000+ HAPPY CUSTOMERS',
    'FREE SHIPPING OVER $50', 'NEW ARRIVALS WEEKLY', 'TOP GLOBAL BRANDS',
    'EASY 30-DAY RETURNS', 'SECURE CHECKOUT', '50,000+ HAPPY CUSTOMERS',
  ];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => {
        this.featured = products.slice(0, 4);
        this.categories = this.categories.map(cat => ({
          ...cat,
          count: products.filter(p => p.category === cat.name).length
        }));
      },
      error: () => {}
    });
  }

  cardClass(i: number): string {
    const c = ['', 'gs-pcard--mint', 'gs-pcard--blush'];
    return c[i % 3];
  }
}
