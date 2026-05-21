import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load products. Make sure the backend is running on port 8000.';
        this.loading = false;
      }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
      },
      error: () => {
        alert('Failed to delete product.');
      }
    });
  }
}
