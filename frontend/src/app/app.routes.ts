import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '',             component: LandingComponent },
  { path: 'login',        component: LoginComponent },
  { path: 'register',     component: RegisterComponent },
  { path: 'home',         component: HomeComponent },
  { path: 'product/:id',  component: ProductDetailComponent },
  { path: 'cart',         component: CartComponent },
  { path: 'checkout',     component: CheckoutComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'profile',      component: ProfileComponent },
  { path: '**',           redirectTo: '' },
];
