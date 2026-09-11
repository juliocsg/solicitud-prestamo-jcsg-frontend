import { Loan, LoanStatus } from '../models/loan.model';
import { User } from '../models/user.model';

export interface MockUser extends User {
  password: string;
}

export const LOANS_KEY = 'mock_loans';
export const INTEREST_RATE = 12;

export const MOCK_USERS: MockUser[] = [
  { id: 1, name: 'Administrador', email: 'admin@test.com', password: '123', role: 'ADMIN' },
  { id: 2, name: 'Usuario Demo', email: 'usuario@test.com', password: '123', role: 'USER' },
  { id: 3, name: 'Carlos Lopez', email: 'carlos@test.com', password: '123', role: 'USER' },
  { id: 4, name: 'Maria Gomez', email: 'maria@test.com', password: '123', role: 'USER' },
  { id: 5, name: 'Pedro Ruiz', email: 'pedro@test.com', password: '123', role: 'USER' }
];

export function monthlyPayment(amount: number, termMonths: number): number {
  const r = INTEREST_RATE / 100 / 12;
  const factor = Math.pow(1 + r, termMonths);
  return Math.round((amount * ((r * factor) / (factor - 1))) * 100) / 100;
}

function iso(daysAgo: number, plusHours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() + plusHours);
  return d.toISOString();
}

function loan(
  id: number,
  userId: number,
  userName: string,
  amount: number,
  termMonths: number,
  status: LoanStatus,
  createdDaysAgo: number,
  reviewedDaysAgo: number | null = null
): Loan {
  const monthly = monthlyPayment(amount, termMonths);
  return {
    id,
    amount,
    termMonths,
    interestRate: INTEREST_RATE,
    monthlyPayment: monthly,
    totalAmount: Math.round(monthly * termMonths * 100) / 100,
    status,
    createdAt: iso(createdDaysAgo),
    reviewedAt: reviewedDaysAgo === null ? null : iso(reviewedDaysAgo),
    userId,
    userName
  };
}

export const MOCK_LOANS: Loan[] = [
  loan(1, 2, 'Usuario Demo', 5000, 12, 'APPROVED', 40, 38),
  loan(2, 2, 'Usuario Demo', 15000, 36, 'PENDING', 2),
  loan(3, 3, 'Carlos Lopez', 30000, 60, 'PENDING', 1),
  loan(4, 3, 'Carlos Lopez', 20000, 48, 'APPROVED', 90, 85),
  loan(5, 4, 'Maria Gomez', 12000, 24, 'APPROVED', 60, 55),
  loan(6, 4, 'Maria Gomez', 40000, 72, 'REJECTED', 20, 18),
  loan(7, 4, 'Maria Gomez', 8000, 18, 'PENDING', 3),
  loan(8, 5, 'Pedro Ruiz', 6000, 12, 'REJECTED', 15, 13),
  loan(9, 5, 'Pedro Ruiz', 25000, 60, 'APPROVED', 120, 112)
];