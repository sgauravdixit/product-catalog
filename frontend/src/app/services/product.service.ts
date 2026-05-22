import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  category_name: string;
  badge?: string;
}

interface ApiCategory {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private toProduct(a: ApiProduct): Product {
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      stock: a.stock,
      image: a.image_url,
      category: a.category_name,
      badge: a.badge
    };
  }

  getAll(): Observable<Product[]> {
    return this.http.get<ApiProduct[]>(`${this.base}/products`).pipe(
      map(items => items.map(p => this.toProduct(p)))
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ApiProduct>(`${this.base}/products/${id}`).pipe(
      map(p => this.toProduct(p))
    );
  }

  getByCategory(name: string): Observable<Product[]> {
    return this.http.get<ApiProduct[]>(`${this.base}/products/category/${encodeURIComponent(name)}`).pipe(
      map(items => items.map(p => this.toProduct(p)))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<ApiCategory[]>(`${this.base}/categories`).pipe(
      map(cats => cats.map(c => c.name))
    );
  }
}
