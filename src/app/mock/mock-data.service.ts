import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Loan, LoanStatus } from '../models/loan.model';
import { User } from '../models/user.model';
import { INTEREST_RATE, LOANS_KEY, MOCK_LOANS, monthlyPayment } from './mock-data';

const DEMO_KEY = 'demo_mode';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private demoModeSubject = new BehaviorSubject<boolean>(this.readDemoMode());

  demoMode$: Observable<boolean> = this.demoModeSubject.asObservable();

  setDemoMode(active: boolean): void {
    if (active) {
      localStorage.setItem(DEMO_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
    this.demoModeSubject.next(active);
  }

  isDemoMode(): boolean {
    return this.demoModeSubject.value;
  }

  getLoans(): Loan[] {
    const raw = localStorage.getItem(LOANS_KEY);
    if (raw) {
      return JSON.parse(raw) as Loan[];
    }
    localStorage.setItem(LOANS_KEY, JSON.stringify(MOCK_LOANS));
    return [...MOCK_LOANS];
  }

  getLoansByUser(user: User): Loan[] {
    return this.getLoans().filter((l) => l.userId === user.id);
  }

  createLoan(amount: number, termMonths: number, user: User): Loan {
    const loans = this.getLoans();
    const monthly = monthlyPayment(amount, termMonths);
    const nextId = loans.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    const loan: Loan = {
      id: nextId,
      amount,
      termMonths,
      interestRate: INTEREST_RATE,
      monthlyPayment: monthly,
      totalAmount: Math.round(monthly * termMonths * 100) / 100,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      userId: user.id,
      userName: user.name
    };
    loans.push(loan);
    this.persist(loans);
    return loan;
  }

  reviewLoan(id: number, status: LoanStatus): Loan | null {
    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === id);
    if (!loan) {
      return null;
    }
    loan.status = status;
    loan.reviewedAt = new Date().toISOString();
    this.persist(loans);
    return loan;
  }

  deleteLoan(id: number): void {
    this.persist(this.getLoans().filter((l) => l.id !== id));
  }

  reset(): void {
    localStorage.setItem(LOANS_KEY, JSON.stringify(MOCK_LOANS));
  }

  private persist(loans: Loan[]): void {
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  }

  private readDemoMode(): boolean {
    return localStorage.getItem(DEMO_KEY) === 'true';
  }
}