import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

const USER_KEY = 'shopmart_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(full_name: string, email: string, password: string, phone?: string): Observable<User> {
    return this.http.post<User>(`${this.base}/users/register`, { full_name, email, password, phone }).pipe(
      tap(user => localStorage.setItem(USER_KEY, JSON.stringify(user)))
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.base}/users/login`, { email, password }).pipe(
      tap(user => localStorage.setItem(USER_KEY, JSON.stringify(user)))
    );
  }

  logout(): void {
    localStorage.removeItem(USER_KEY);
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getUserId(): number | null {
    return this.getCurrentUser()?.id ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}
