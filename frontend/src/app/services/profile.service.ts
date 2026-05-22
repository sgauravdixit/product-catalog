import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.base}/users/${userId}`);
  }

  updateProfile(userId: number, data: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.base}/users/${userId}`, data);
  }
}
