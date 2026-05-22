import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private cartService = inject(CartService);

  email = '';
  password = '';
  loading = false;
  error = '';

  login(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.cartService.loadCart();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail ?? 'Login failed. Please try again.';
      }
    });
  }
}
