import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Loan, LoanStatus } from '../models/loan.model';
import { Role } from '../models/user.model';
import { LOANS_KEY, MOCK_LOANS, MOCK_USERS, MockUser, monthlyPayment } from '../mock/mock-data';

interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  exp: number;
}

function b64Encode(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/=+$/, '');
}

function createFakeJwt(user: MockUser): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 60 * 60 * 1000
  };
  return `${b64Encode(header)}.${b64Encode(payload)}.mock-signature`;
}

function decodeToken(token: string | null): JwtPayload | null {
  if (!token?.startsWith('Bearer ')) return null;
  try {
    const part = token.slice(7).split('.')[1];
    const payload = JSON.parse(atob(part)) as JwtPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getLoans(): Loan[] {
  const raw = localStorage.getItem(LOANS_KEY);
  if (raw) return JSON.parse(raw) as Loan[];
  localStorage.setItem(LOANS_KEY, JSON.stringify(MOCK_LOANS));
  return [...MOCK_LOANS];
}

function saveLoans(loans: Loan[]): void {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

function nextLoanId(loans: Loan[]): number {
  return loans.reduce((max, l) => Math.max(max, l.id), 0) + 1;
}

function ok(url: string, body: unknown) {
  return of(new HttpResponse({ status: 200, url, body }));
}

function fail(url: string, status: number, message: string) {
  return throwError(
    () => new HttpErrorResponse({ status, url, error: { error: message } })
  );
}

export const apiMockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.replace(/\/+$/, '');

  if (!url.includes('/api/')) {
    return next(req);
  }

  if (url.endsWith('/api/auth/login') && req.method === 'POST') {
    const { email, password } = req.body as { email: string; password: string };
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      return fail(req.url, 401, 'Credenciales invalidas');
    }
    return of(
      new HttpResponse({
        status: 200,
        body: {
          token: createFakeJwt(user),
          tokenType: 'Bearer',
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    );
  }

  if (url.includes('/api/loans')) {
    const payload = decodeToken(req.headers.get('Authorization'));
    if (!payload) {
      return fail(req.url, 401, 'No autorizado');
    }

    if (req.method === 'GET' && url.endsWith('/api/loans/my')) {
      const loans = getLoans().filter((l) => l.userId === payload.sub);
      return ok(req.url, loans);
    }

    if (req.method === 'GET' && url.endsWith('/api/loans')) {
      return ok(req.url, getLoans());
    }

    if (req.method === 'POST' && url.endsWith('/api/loans')) {
      const { amount, termMonths } = req.body as { amount: number; termMonths: number };
      const user = MOCK_USERS.find((u) => u.id === payload.sub);
      const loans = getLoans();
      const loan: Loan = {
        id: nextLoanId(loans),
        amount,
        termMonths,
        interestRate: 12,
        monthlyPayment: monthlyPayment(amount, termMonths),
        totalAmount: Math.round(monthlyPayment(amount, termMonths) * termMonths * 100) / 100,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        userId: payload.sub,
        userName: user?.name ?? 'Usuario'
      };
      saveLoans([...loans, loan]);
      return of(new HttpResponse({ status: 201, url, body: loan }));
    }

    const reviewMatch = url.match(/\/api\/loans\/(\d+)$/);
    if (req.method === 'PUT' && reviewMatch) {
      const id = Number(reviewMatch[1]);
      const { status } = req.body as { status: LoanStatus };
      const loans = getLoans();
      const idx = loans.findIndex((l) => l.id === id);
      if (idx === -1) {
        return fail(url, 404, 'Prestamo no encontrado');
      }
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        return fail(url, 400, 'Estado inválido');
      }
      const updated: Loan = { ...loans[idx], status, reviewedAt: new Date().toISOString() };
      loans[idx] = updated;
      saveLoans(loans);
      return ok(url, updated);
    }

    return fail(url, 404, 'Ruta no encontrada');
  }

  return next(req);
};