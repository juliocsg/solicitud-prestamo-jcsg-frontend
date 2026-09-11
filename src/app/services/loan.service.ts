import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Loan, LoanRequestPayload, LoanStatus } from '../models/loan.model';
import { User } from '../models/user.model';
import { MockDataService } from '../mock/mock-data.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private apiUrl = 'http://localhost:8080/api/loans';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private mockData: MockDataService
  ) {}

  requestLoan(payload: LoanRequestPayload): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, payload).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          const user = this.requireUser();
          if (!user) {
            return throwError(() => err);
          }
          return of(this.mockData.createLoan(payload.amount, payload.termMonths, user));
        }
        return throwError(() => err);
      })
    );
  }

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/my`).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          const user = this.requireUser();
          if (!user) {
            return of([]);
          }
          return of(this.mockData.getLoansByUser(user));
        }
        return throwError(() => err);
      })
    );
  }

  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          return of(this.mockData.getLoans());
        }
        return throwError(() => err);
      })
    );
  }

  getLoansByStatus(status: LoanStatus): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/status/${status}`).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          return of(this.mockData.getLoans().filter((l) => l.status === status));
        }
        return throwError(() => err);
      })
    );
  }

  reviewLoan(id: number, status: LoanStatus): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/${id}`, { status }).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          const updated = this.mockData.reviewLoan(id, status);
          return updated ? of(updated) : throwError(() => err);
        }
        return throwError(() => err);
      })
    );
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        if (this.isNetworkError(err)) {
          this.mockData.deleteLoan(id);
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  }

  private isNetworkError(err: unknown): boolean {
    if (!(err instanceof HttpErrorResponse)) {
      return false;
    }
    const isNetwork = err.status === 0 || err.status >= 500;
    if (isNetwork) {
      this.mockData.setDemoMode(true);
    }
    return isNetwork;
  }

  private requireUser(): User | null {
    return this.authService.getUser();
  }
}