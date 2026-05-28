import { Component, inject, HostListener, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cart = inject(CartService);

  scrolled = false;
  badgeBounce = false;
  private prevCount = 0;

  constructor() {
    effect(() => {
      const current = this.cart.count();
      if (current > this.prevCount) {
        this.badgeBounce = false;
        requestAnimationFrame(() => {
          this.badgeBounce = true;
          setTimeout(() => { this.badgeBounce = false; }, 500);
        });
      }
      this.prevCount = current;
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }
}
