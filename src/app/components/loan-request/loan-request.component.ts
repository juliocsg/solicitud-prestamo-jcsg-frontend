import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h1>Solicitar Préstamo</h1>
        <p class="subtitle">Completa los datos y envia tu solicitud para revision</p>
      </div>
      <a routerLink="/loans" class="btn-back">&#8592; Mis préstamos</a>
    </div>

    <div class="layout-grid">
      <div class="form-card">
        <form [formGroup]="loanForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="amount">Monto solicitado (USD)</label>
            <div class="input-with-symbol">
              <span class="symbol">$</span>
              <input
                id="amount" type="number" formControlName="amount" placeholder="0.00"
                min="1000"
                [class.invalid]="loanForm.get('amount')?.invalid && loanForm.get('amount')?.touched"
              />
            </div>
            <span class="error" *ngIf="loanForm.get('amount')?.errors?.['required'] && loanForm.get('amount')?.touched">
              El monto es obligatorio
            </span>
            <span class="error" *ngIf="loanForm.get('amount')?.errors?.['min'] && loanForm.get('amount')?.touched">
              El monto minimo es $1,000
            </span>
          </div>

          <div class="form-group">
            <label for="termMonths">Plazo (meses)</label>
            <input
              id="termMonths" type="number" formControlName="termMonths" placeholder="12"
              min="1" max="120"
              [class.invalid]="loanForm.get('termMonths')?.invalid && loanForm.get('termMonths')?.touched"
            />
            <span class="error" *ngIf="loanForm.get('termMonths')?.errors?.['required'] && loanForm.get('termMonths')?.touched">
              El plazo es obligatorio
            </span>
            <span class="error" *ngIf="loanForm.get('termMonths')?.errors?.['min'] && loanForm.get('termMonths')?.touched">
              Minimo 1 mes
            </span>
            <span class="error" *ngIf="loanForm.get('termMonths')?.errors?.['max'] && loanForm.get('termMonths')?.touched">
              Maximo 120 meses
            </span>
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/loans" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="loanForm.invalid || submitting">
              {{ submitting ? 'Enviando...' : 'Solicitar Préstamo' }}
            </button>
          </div>
        </form>
      </div>

      <div class="quote-card" *ngIf="quote">
        <h3>Estimacion de pago</h3>
        <p class="quote-note" *ngIf="!quoteValid">Complete monto y plazo para calcular</p>
        <ng-container *ngIf="quoteValid">
          <div class="quote-row">
            <span>Monto</span>
            <strong>{{ quote.amount | currency:'USD':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="quote-row">
            <span>Plazo</span>
            <strong>{{ quote.termMonths }} meses</strong>
          </div>
          <div class="quote-row">
            <span>Tasa anual</span>
            <strong>12%</strong>
          </div>
          <div class="divider"></div>
          <div class="quote-row total">
            <span>Pago mensual</span>
            <strong>{{ quote.monthly | currency:'USD':'symbol':'1.2-2' }}</strong>
          </div>
          <div class="quote-row total">
            <span>Total a pagar</span>
            <strong>{{ quote.total | currency:'USD':'symbol':'1.2-2' }}</strong>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; color: #0f172a; }
    .subtitle { color: #64748b; margin: 0.3rem 0 0; font-size: 0.95rem; }
    .btn-back { color: #0f766e; text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
    .layout-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
    .form-card, .quote-card { background: white; border-radius: 14px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .form-group { margin-bottom: 1.4rem; }
    label { display: block; margin-bottom: 0.45rem; font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    input {
      width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 1.05rem; box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s; background: #f8fafc;
    }
    input:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,0.15); background: white; }
    input.invalid { border-color: #dc2626; }
    .input-with-symbol { position: relative; }
    .input-with-symbol .symbol { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1.1rem; }
    .input-with-symbol input { padding-left: 30px; }
    .error { color: #dc2626; font-size: 0.8rem; display: block; margin-top: 0.3rem; }
    .form-actions { display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 1.6rem; }
    .btn-cancel, .btn-primary { padding: 11px 22px; border: none; border-radius: 10px; font-size: 0.95rem; cursor: pointer; font-weight: 600; }
    .btn-cancel { background: #f1f5f9; color: #475569; }
    .btn-primary { background: linear-gradient(135deg, #0f766e, #115e59); color: white; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .quote-card h3 { margin: 0 0 1.2rem; font-size: 1.05rem; color: #0f172a; }
    .quote-note { color: #94a3b8; font-size: 0.9rem; }
    .quote-row { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 0; }
    .quote-row span { color: #64748b; font-size: 0.92rem; }
    .quote-row strong { color: #0f172a; font-size: 1rem; }
    .quote-row.total strong { font-size: 1.25rem; color: #0f766e; }
    .divider { border-top: 1px dashed #e2e8f0; margin: 0.6rem 0; }
    @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } }
  `]
})
export class LoanRequestComponent implements OnDestroy {
  loanForm: FormGroup;
  submitting = false;
  quote: { amount: number; termMonths: number; monthly: number; total: number } | null = null;
  quoteValid = false;
  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private notify: NotificationService
  ) {
    this.loanForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
      termMonths: [null, [Validators.required, Validators.min(1), Validators.max(120)]]
    });

    this.subs.push(
      this.loanForm.valueChanges.subscribe(() => this.calculateQuote())
    );
  }

  calculateQuote(): void {
    const { amount, termMonths } = this.loanForm.value;
    if (!amount || !termMonths || amount <= 0 || termMonths <= 0) {
      this.quoteValid = false;
      return;
    }
    const monthlyRate = 0.12 / 12;
    const factor = Math.pow(1 + monthlyRate, termMonths);
    const monthly = amount * (monthlyRate * factor) / (factor - 1);
    this.quote = {
      amount,
      termMonths,
      monthly: Math.round(monthly * 100) / 100,
      total: Math.round(monthly * termMonths * 100) / 100
    };
    this.quoteValid = true;
  }

  onSubmit(): void {
    if (this.loanForm.invalid) return;
    this.submitting = true;
    const payload = {
      amount: this.loanForm.get('amount')!.value,
      termMonths: this.loanForm.get('termMonths')!.value
    };
    this.loanService.requestLoan(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.notify.success('Solicitud enviada. Queda en revision.');
        this.loanForm.reset();
        this.quoteValid = false;
        this.quote = null;
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err.error?.error || 'Error al enviar la solicitud');
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}