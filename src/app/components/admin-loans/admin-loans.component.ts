import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';
import { NotificationService } from '../../services/notification.service';
import { ExportService } from '../../services/export.service';
import { Loan, LoanStatus } from '../../models/loan.model';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Gestión de préstamos</h1>
        <p class="subtitle">Aprueba o rechaza las solicitudes pendientes</p>
      </div>
      <div class="page-actions">
        <button type="button" class="btn-export" (click)="exportExcel()" [disabled]="loans.length === 0">Descargar Excel</button>
        <div class="tabs">
          <button
            class="tab" [class.active]="filter === 'PENDING'" (click)="setFilter('PENDING')">
            Pendientes ({{ pendingCount }})
          </button>
          <button
            class="tab" [class.active]="filter === 'ALL'" (click)="setFilter('ALL')">
            Todos
          </button>
        </div>
      </div>
    </div>

    <div class="table-container" *ngIf="loans.length > 0; else empty">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Solicitante</th>
            <th>Monto</th>
            <th>Plazo</th>
            <th>Pago mensual</th>
            <th>Solicitado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let loan of loans">
            <td class="muted">#{{ loan.id }}</td>
            <td>
              <div class="owner">
                <div class="owner-avatar">{{ loan.userName.charAt(0) || '?' }}</div>
                <span>{{ loan.userName }}</span>
              </div>
            </td>
            <td><strong>{{ loan.amount | currency:'USD':'symbol':'1.0-0' }}</strong></td>
            <td>{{ loan.termMonths }} meses</td>
            <td>{{ loan.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</td>
            <td>{{ loan.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + loan.status.toLowerCase()">
                {{ statusLabel(loan.status) }}
              </span>
            </td>
            <td class="actions" *ngIf="loan.status === 'PENDING'; else reviewedCells">
              <button class="btn-approve" (click)="review(loan, 'APPROVED')">Aprobar</button>
              <button class="btn-reject" (click)="review(loan, 'REJECTED')">Rechazar</button>
            </td>
            <ng-template #reviewedCells>
              <td class="muted">
                {{ loan.reviewedAt ? ('Revisado ' + (loan.reviewedAt | date:'dd/MM/yyyy')) : '—' }}
              </td>
            </ng-template>
          </tr>
        </tbody>
      </table>
    </div>

    <ng-template #empty>
      <div class="empty-state">
        <h3>No hay solicitudes {{ filter === 'PENDING' ? 'pendientes' : '' }}</h3>
        <p class="muted">Las nuevas solicitudes apareceran aqui.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; color: #0f172a; }
    .subtitle { color: #64748b; margin: 0.3rem 0 0; font-size: 0.95rem; }
    .page-actions { display: flex; align-items: center; gap: 0.9rem; }
    .btn-export {
      padding: 10px 16px; border-radius: 10px; border: 1.5px solid #0f766e; background: white;
      color: #0f766e; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-export:hover:not(:disabled) { background: #f0fdfa; }
    .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
    .tabs { display: flex; gap: 0.5rem; background: #e2e8f0; padding: 4px; border-radius: 10px; }
    .tab { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; color: #475569; transition: all 0.2s; }
    .tab.active { background: white; color: #0f766e; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 0.92rem; }
    th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
    tr:hover { background: #f8fafc; }
    .muted { color: #94a3b8; }

    .owner { display: flex; align-items: center; gap: 0.6rem; }
    .owner-avatar { width: 30px; height: 30px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }

    .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 5px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .badge-approved { background: #dcfce7; color: #15803d; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }

    .actions { display: flex; gap: 0.5rem; }
    .btn-approve, .btn-reject { padding: 8px 14px; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-approve { background: #16a34a; color: white; }
    .btn-approve:hover { opacity: 0.85; }
    .btn-reject { background: #dc2626; color: white; }
    .btn-reject:hover { opacity: 0.85; }

    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .empty-state h3 { margin: 0 0 0.4rem; color: #0f172a; }
  `]
})
export class AdminLoansComponent implements OnInit {
  loans: Loan[] = [];
  filter: 'PENDING' | 'ALL' = 'PENDING';
  pendingCount = 0;

  constructor(
    private loanService: LoanService,
    private notify: NotificationService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loanService.getAllLoans().subscribe({
      next: (data) => {
        this.pendingCount = data.filter((l) => l.status === 'PENDING').length;
        this.applyFilter(data);
      },
      error: () => this.notify.error('Error al cargar los prestamos')
    });
  }

  setFilter(filter: 'PENDING' | 'ALL'): void {
    this.filter = filter;
    this.loanService.getAllLoans().subscribe({
      next: (data) => this.applyFilter(data),
      error: () => this.notify.error('Error al cargar los prestamos')
    });
  }

  private applyFilter(all: Loan[]): void {
    this.loans = this.filter === 'PENDING' ? all.filter((l) => l.status === 'PENDING') : all;
  }

  review(loan: Loan, status: LoanStatus): void {
    this.loanService.reviewLoan(loan.id, status).subscribe({
      next: () => {
        this.notify.success(
          `Prestamo #${loan.id} ${status === 'APPROVED' ? 'aprobado' : 'rechazado'} correctamente`
        );
        this.load();
      },
      error: (err) => this.notify.error(err.error?.error || 'Error al revisar el prestamo')
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
      l.userName,
      l.amount,
      l.termMonths,
      l.monthlyPayment,
      l.totalAmount,
      new Date(l.createdAt).toLocaleDateString('es-ES'),
      l.reviewedAt ? new Date(l.reviewedAt).toLocaleDateString('es-ES') : '',
      this.statusLabel(l.status)
    ]);
    this.exportService.exportToExcel(
      'gestion-prestamos',
      [
        'ID',
        'Solicitante',
        'Monto (USD)',
        'Plazo (meses)',
        'Pago mensual (USD)',
        'Total (USD)',
        'Solicitado',
        'Revisado',
        'Estado'
      ],
      rows
    );
  }
}