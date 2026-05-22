import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  orderService = inject(OrderService);

  activeTab = 'overview';

  tabs = [
    { id: 'overview',   label: 'Overview',   icon: 'grid' },
    { id: 'orders',     label: 'My Orders',  icon: 'package' },
    { id: 'addresses',  label: 'Addresses',  icon: 'map' },
    { id: 'settings',   label: 'Settings',   icon: 'settings' },
  ];

  setTab(id: string): void {
    this.activeTab = id;
  }

  get lastOrder() {
    return this.orderService.lastOrder();
  }
}
