import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { logout } from '../../store/auth/auth.actions';
import { selectUser } from '../../store/auth/auth.selectors';
import { MockDataService } from '../../mock/mock-data.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  template: `
    <header class="topbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">
          <span class="brand-icon">&#9670;</span>
          <span>Banco Central</span>
        </a>

        <nav class="nav-links" *ngIf="user$ | async as user">
          <ng-container *ngIf="user.role === 'ADMIN'">
            <a routerLink="/admin/loans" routerLinkActive="active">Gestión de préstamos</a>
          </ng-container>
          <ng-container *ngIf="user.role === 'USER'">
            <a routerLink="/loans" routerLinkActive="active">Mis préstamos</a>
            <a routerLink="/loans/new" routerLinkActive="active">Solicitar Préstamo</a>
          </ng-container>
        </nav>

        <div class="user-area" *ngIf="user$ | async as user">
          <span class="demo-badge" *ngIf="demoMode$ | async">Modo Demo</span>
          <div class="user-chip">
            <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role" [class.admin]="user.role === 'ADMIN'">{{ user.role }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="onLogout()">Salir</button>
        </div>
      </div>
    </header>
    <main class="page">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .topbar {
      background: #0f172a; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
      display: flex; align-items: center; height: 64px; gap: 2rem;
    }
    .brand { display: flex; align-items: center; gap: 0.6rem; color: white; text-decoration: none; font-size: 1.15rem; font-weight: 700; }
    .brand-icon { color: #2dd4bf; font-size: 1.2rem; }
    .nav-links { display: flex; gap: 0.25rem; }
    .nav-links a {
      color: #94a3b8; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px;
      font-size: 0.92rem; font-weight: 500; transition: all 0.2s;
    }
    .nav-links a:hover { color: white; background: rgba(255,255,255,0.08); }
    .nav-links a.active { color: white; background: rgba(45,212,191,0.15); }
    .user-area { margin-left: auto; display: flex; align-items: center; gap: 1rem; }
    .demo-badge {
      background: rgba(250, 204, 21, 0.15); color: #fbbf24; border: 1px solid rgba(250, 204, 21, 0.4);
      padding: 3px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px;
    }
    .user-chip { display: flex; align-items: center; gap: 0.7rem; }
    .avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #0f766e, #2dd4bf); color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700;
    }
    .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { color: white; font-size: 0.85rem; font-weight: 600; }
    .user-role { font-size: 0.68rem; color: #2dd4bf; font-weight: 700; letter-spacing: 0.5px; }
    .user-role.admin { color: #60a5fa; }
    .btn-logout {
      background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #cbd5e1;
      padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 0.82rem; transition: all 0.2s;
    }
    .btn-logout:hover { background: rgba(255,255,255,0.1); color: white; }
    .page { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
  `]
})
export class LayoutComponent {
  private store = inject(Store);
  private mockData = inject(MockDataService);

  user$ = this.store.select(selectUser);
  demoMode$ = this.mockData.demoMode$;

  onLogout(): void {
    this.store.dispatch(logout());
  }
}