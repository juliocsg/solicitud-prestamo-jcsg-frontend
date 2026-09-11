import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { login, loadUserFromStorage } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';
import { Role } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-grid">
        <div class="login-hero">
          <div class="hero-content">
            <div class="hero-badge">Banco Central</div>
            <h1>Préstamos<br>inteligentes</h1>
            <p>Gestiona solicitudes, aprueba créditos y sigue el estado de tus prestamos en tiempo real.</p>
            <div class="hero-stats">
              <div class="stat">
                <strong>12%</strong>
                <span>tasa anual</span>
              </div>
              <div class="stat">
                <strong>120</strong>
                <span>meses max.</span>
              </div>
              <div class="stat">
                <strong>100%</strong>
                <span>digital</span>
              </div>
            </div>
          </div>
        </div>

        <div class="login-panel">
          <div class="login-card">
            <div class="login-header">
              <h2>Bienvenido</h2>
              <p>Ingresa con tu correo para continuar</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="email">Correo electrónico</label>
                <input
                  id="email" type="email" formControlName="email"
                  placeholder="usuario@test.com"
                  [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                />
                <span class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                  Ingresa un email válido
                </span>
              </div>

              <div class="form-group">
                <label for="password">Contrasena</label>
                <input
                  id="password" type="password" formControlName="password"
                  placeholder="••••••"
                  [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                />
                <span class="error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  La contrasena es obligatoria
                </span>
              </div>

              <div class="error-msg" *ngIf="error$ | async as error">{{ error }}</div>

              <button type="submit" class="btn-login" [disabled]="loginForm.invalid || (loading$ | async)">
                {{ (loading$ | async) ? 'Ingresando...' : 'Ingresar' }}
              </button>
            </form>

            <div class="login-footer">
              <p>Cuentas de demostracion:</p>
              <div class="demo-accounts">
                <button
                  type="button"
                  class="demo-chip"
                  *ngFor="let acc of demoAccounts"
                  (click)="fill(acc.email, acc.password)"
                >
                  <span class="chip-role" [class.admin]="acc.role === 'ADMIN'">
                    {{ acc.role === 'ADMIN' ? 'Admin' : 'User' }}
                  </span>
                  <span class="chip-label">{{ acc.label }}</span>
                </button>
              </div>
              <p class="demo-hint">Todas usan la contrasena <strong>123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .login-wrapper { min-height: 100vh; background: #0f172a; }
    .login-grid { display: grid; grid-template-columns: 1.2fr 1fr; min-height: 100vh; }

    .login-hero {
      background: linear-gradient(135deg, #0f766e 0%, #115e59 50%, #134e4a 100%);
      display: flex; align-items: center; justify-content: center; padding: 3rem;
      position: relative; overflow: hidden;
    }
    .login-hero::before {
      content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%);
      top: -150px; right: -150px;
    }
    .hero-content { max-width: 460px; z-index: 1; color: white; }
    .hero-badge {
      display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 1.5rem;
      text-transform: uppercase;
    }
    .hero-content h1 { font-size: 3rem; line-height: 1.15; margin-bottom: 1rem; font-weight: 700; }
    .hero-content p { color: rgba(255,255,255,0.85); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2.5rem; }
    .hero-stats { display: flex; gap: 2rem; }
    .stat strong { display: block; font-size: 1.8rem; }
    .stat span { color: rgba(255,255,255,0.7); font-size: 0.85rem; }

    .login-panel {
      display: flex; align-items: center; justify-content: center; padding: 2rem;
      background: #f8fafc;
    }
    .login-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
    .login-header { margin-bottom: 2rem; }
    .login-header h2 { font-size: 1.6rem; color: #0f172a; margin: 0 0 0.4rem; }
    .login-header p { color: #64748b; font-size: 0.95rem; }

    .form-group { margin-bottom: 1.3rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    input {
      width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s; background: #f8fafc;
    }
    input:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,0.15); background: white; }
    input.invalid { border-color: #dc2626; }
    .error { color: #dc2626; font-size: 0.8rem; display: block; margin-top: 0.3rem; }

    .error-msg {
      color: #b91c1c; font-size: 0.85rem; margin-bottom: 1rem; text-align: center;
      background: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #fecaca;
    }

    .btn-login {
      width: 100%; padding: 13px; background: linear-gradient(135deg, #0f766e, #115e59); color: white;
      border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }
    .btn-login:hover:not(:disabled) { opacity: 0.9; }
    .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }

    .login-footer { margin-top: 2rem; padding-top: 1.2rem; border-top: 1px solid #e2e8f0; }
    .login-footer p { color: #64748b; font-size: 0.8rem; margin-bottom: 0.8rem; }
    .demo-accounts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .demo-chip {
      display: flex; align-items: center; gap: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0;
      padding: 8px 10px; border-radius: 8px; font-size: 0.8rem; color: #334155; cursor: pointer; text-align: left;
      transition: border-color 0.2s, background 0.2s, transform 0.1s;
    }
    .demo-chip:hover { border-color: #0f766e; background: #f0fdfa; transform: translateY(-1px); }
    .demo-chip:active { transform: translateY(0); }
    .chip-role { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dcfce7; color: #15803d; flex-shrink: 0; }
    .chip-role.admin { background: #dbeafe; color: #1d4ed8; }
    .chip-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .demo-hint { margin-top: 0.9rem; color: #94a3b8; font-size: 0.75rem; }

    @media (max-width: 900px) {
      .login-grid { grid-template-columns: 1fr; }
      .login-hero { display: none; }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  demoAccounts: { email: string; password: string; role: Role; label: string }[] = [
    { email: 'admin@test.com', password: '123', role: 'ADMIN', label: 'Administrador' },
    { email: 'usuario@test.com', password: '123', role: 'USER', label: 'Usuario Demo' },
    { email: 'carlos@test.com', password: '123', role: 'USER', label: 'Carlos Lopez' },
    { email: 'maria@test.com', password: '123', role: 'USER', label: 'Maria Gomez' },
    { email: 'pedro@test.com', password: '123', role: 'USER', label: 'Pedro Ruiz' }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.store.dispatch(loadUserFromStorage());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    this.store.dispatch(login({ email, password }));
  }

  fill(email: string, password: string): void {
    this.loginForm.setValue({ email, password });
  }
}