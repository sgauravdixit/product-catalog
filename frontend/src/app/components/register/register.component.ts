import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private cartService = inject(CartService);

  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  register(): void {
    this.loading = true;
    this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.cartService.loadCart();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail ?? 'Registration failed. Please try again.';
      }
    });
  }
}
