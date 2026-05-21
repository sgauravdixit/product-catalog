import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreate } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  createProduct(product: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
