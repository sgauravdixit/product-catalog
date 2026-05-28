import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { OrderService, ApiOrder } from '../../services/order.service';
import { ProfileService, UserUpdate } from '../../services/profile.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, TitleCasePipe, DatePipe, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private orderService = inject(OrderService);
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  user: User | null = null;
  orders: ApiOrder[] = [];
  expandedOrders = new Set<number>();
  activeTab = 'overview';
  saveLoading = false;
  saveSuccess = false;

  // Settings form fields
  editName = '';
  editPhone = '';
  editAddress1 = '';
  editCity = '';
  editState = '';
  editZip = '';

  tabs = [
    { id: 'overview',  label: 'Overview',  icon: 'grid' },
    { id: 'orders',    label: 'My Orders', icon: 'package' },
    { id: 'addresses', label: 'Addresses', icon: 'map' },
    { id: 'settings',  label: 'Settings',  icon: 'settings' },
  ];

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    const userId = this.auth.getUserId();
    if (userId) {
      this.orderService.getUserOrders(userId).subscribe({
        next: orders => this.orders = orders,
        error: () => {}
      });
      // Load fresh profile from backend
      this.profileService.getProfile(userId).subscribe({
        next: user => {
          this.user = user;
          localStorage.setItem('shopmart_user', JSON.stringify(user));
          this.editName = user.full_name;
          this.editPhone = user.phone ?? '';
          this.editAddress1 = user.address_line1 ?? '';
          this.editCity = user.city ?? '';
          this.editState = user.state ?? '';
          this.editZip = user.zip_code ?? '';
        },
        error: () => {}
      });
    }
  }

  setTab(id: string): void { this.activeTab = id; }

  toggleOrder(orderId: number): void {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrders.has(orderId);
  }

  get initials(): string {
    if (!this.user) return 'U';
    return this.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  get firstName(): string {
    return this.user?.full_name.split(' ')[0] ?? 'there';
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, o) => sum + o.total_amount, 0);
  }

  get lastOrder() {
    return this.orderService.lastOrder();
  }

  saveSettings(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.saveLoading = true;
    const update: UserUpdate = {
      full_name: this.editName || undefined,
      phone: this.editPhone || undefined,
      address_line1: this.editAddress1 || undefined,
      city: this.editCity || undefined,
      state: this.editState || undefined,
      zip_code: this.editZip || undefined
    };
    this.profileService.updateProfile(userId, update).subscribe({
      next: user => {
        this.user = user;
        localStorage.setItem('shopmart_user', JSON.stringify(user));
        this.saveLoading = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 2000);
      },
      error: () => { this.saveLoading = false; }
    });
  }
}
