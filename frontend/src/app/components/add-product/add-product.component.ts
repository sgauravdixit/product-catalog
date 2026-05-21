import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  productForm: FormGroup;
  submitting = false;
  error = '';

  categories = ['Electronics', 'Sports', 'Kitchen', 'Accessories', 'Clothing', 'Books', 'Toys', 'Other'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image_url: ['', Validators.required],
    });
  }

  get f() { return this.productForm.controls; }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const product = {
      ...this.productForm.value,
      price: parseFloat(this.productForm.value.price),
      stock: parseInt(this.productForm.value.stock, 10),
    };

    this.productService.createProduct(product).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: () => {
        this.error = 'Failed to add product. Please try again.';
        this.submitting = false;
      }
    });
  }
}
