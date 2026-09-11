import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { NotificationService } from '../../services/notification.service';
import { ExportService } from '../../services/export.service';
import { Loan, LoanStatus } from '../../models/loan.model';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h1>Mis préstamos</h1>
        <p class="subtitle">Consulta el estado de tus solicitudes</p>
      </div>
      <div class="page-actions">
        <button type="button" class="btn-export" (click)="exportExcel()" [disabled]="loans.length === 0">Descargar Excel</button>
        <a routerLink="/loans/new" class="btn-new">+ Nueva solicitud</a>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <span class="sum-label">Solicitado</span>
        <strong>{{ totalRequested | currency:'USD':'symbol':'1.0-0' }}</strong>
      </div>
      <div class="summary-card">
        <span class="sum-label">Aprobado</span>
        <strong>{{ totalApproved | currency:'USD':'symbol':'1.0-0' }}</strong>
      </div>
      <div class="summary-card">
        <span class="sum-label">Activos</span>
        <strong>{{ countApproved }}</strong>
      </div>
    </div>

    <div class="table-container" *ngIf="loans.length > 0; else empty">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Monto</th>
            <th>Plazo</th>
            <th>Pago mensual</th>
            <th>Total</th>
            <th>Solicitado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let loan of loans">
            <td class="muted">#{{ loan.id }}</td>
            <td><strong>{{ loan.amount | currency:'USD':'symbol':'1.0-0' }}</strong></td>
            <td>{{ loan.termMonths }} meses</td>
            <td>{{ loan.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</td>
            <td>{{ loan.totalAmount | currency:'USD':'symbol':'1.2-2' }}</td>
            <td>{{ loan.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + loan.status.toLowerCase()">
                {{ statusLabel(loan.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ng-template #empty>
      <div class="empty-state">
        <div class="empty-icon">&diams;</div>
        <h3>Aun no tienes prestamos</h3>
        <p>Solicita tu primer prestamo para comenzar.</p>
        <a routerLink="/loans/new" class="btn-new">Solicitar Préstamo</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; color: #0f172a; }
    .subtitle { color: #64748b; margin: 0.3rem 0 0; font-size: 0.95rem; }

    .page-actions { display: flex; align-items: center; gap: 0.75rem; }

    .btn-export {
      padding: 11px 18px; border-radius: 10px; border: 1.5px solid #0f766e; background: white;
      color: #0f766e; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-export:hover:not(:disabled) { background: #f0fdfa; }
    .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-new {
      display: inline-block; background: linear-gradient(135deg, #0f766e, #115e59); color: white;
      padding: 11px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .btn-new:hover { opacity: 0.9; }

    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .summary-card { background: white; border-radius: 12px; padding: 1.2rem 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .sum-label { display: block; color: #64748b; font-size: 0.82rem; margin-bottom: 0.4rem; }
    .summary-card strong { font-size: 1.5rem; color: #0f172a; }

    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 0.92rem; }
    th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
    tr:hover { background: #f8fafc; }
    .muted { color: #94a3b8; }

    .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 5px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .badge-approved { background: #dcfce7; color: #15803d; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }

    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .empty-icon { font-size: 2.5rem; color: #2dd4bf; margin-bottom: 0.8rem; }
    .empty-state h3 { margin: 0 0 0.4rem; color: #0f172a; }
    .empty-state p { color: #64748b; margin: 0 0 1.5rem; }
    @media (max-width: 700px) { .summary-cards { grid-template-columns: 1fr; } }
  `]
})
export class LoanListComponent implements OnInit {
  loans: Loan[] = [];
  totalRequested = 0;
  totalApproved = 0;
  countApproved = 0;

  constructor(
    private loanService: LoanService,
    private notify: NotificationService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loanService.getMyLoans().subscribe({
      next: (data) => {
        this.loans = data;
        this.totalRequested = data.reduce((sum, l) => sum + l.amount, 0);
        this.totalApproved = data.filter((l) => l.status === 'APPROVED').reduce((sum, l) => sum + l.amount, 0);
        this.countApproved = data.filter((l) => l.status === 'APPROVED').length;
      },
      error: () => this.notify.error('Error al cargar los prestamos')
    });
  }

  statusLabel(status: LoanStatus): string {
    switch (status) {
      case 'PENDING': return 'En revision';
      case 'APPROVED': return 'Aprobado';
      case 'REJECTED': return 'Rechazado';
    }
  }

  exportExcel(): void {
    if (this.loans.length === 0) {
      this.notify.info('No hay prestamos para exportar');
      return;
    }
    const rows = this.loans.map((l) => [
      l.id,
      l.amount,
      l.termMonths,
      l.monthlyPayment,
      l.totalAmount,
      new Date(l.createdAt).toLocaleDateString('es-ES'),
      this.statusLabel(l.status)
    ]);
    this.exportService.exportToExcel(
      'mis-prestamos',
      ['ID', 'Monto (USD)', 'Plazo (meses)', 'Pago mensual (USD)', 'Total (USD)', 'Solicitado', 'Estado'],
      rows
    );
  }
}