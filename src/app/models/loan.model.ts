export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Loan {
  id: number;
  amount: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalAmount: number;
  status: LoanStatus;
  createdAt: string;
  reviewedAt: string | null;
  userId: number;
  userName: string;
}

export interface LoanRequestPayload {
  amount: number;
  termMonths: number;
}