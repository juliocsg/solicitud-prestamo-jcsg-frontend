import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginResponse, User } from '../models/user.model';
import { MOCK_USERS } from '../mock/mock-data';
import { MockDataService } from '../mock/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          return this.mockLogin(email, password);
        }
        return throwError(() => err);
      })
    );
  }

  private mockLogin(email: string, password: string): Observable<LoginResponse> {
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { error: 'Email o contrasena incorrectos' }
          })
      );
    }
    this.mockData.setDemoMode(true);
    return of({
      token: `demo-token-${user.role.toLowerCase()}-${Date.now()}`,
      tokenType: 'Bearer',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  }

  private isNetworkError(err: unknown): boolean {
    return err instanceof HttpErrorResponse && (err.status === 0 || err.status >= 500);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return !!user && user.role === 'ADMIN';
  }

  saveSession(data: LoginResponse): void {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role })
    );
  }

  clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}