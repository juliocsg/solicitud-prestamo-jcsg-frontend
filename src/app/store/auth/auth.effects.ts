import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { login, loginSuccess, loginFailure, logout } from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            this.authService.saveSession(response);
            return loginSuccess({ response });
          }),
          catchError((err) => {
            const msg =
              err.error?.error || 'No se pudo iniciar sesion. Verifica tus credenciales.';
            return of(loginFailure({ error: msg }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ response }) => {
          const target = response.role === 'ADMIN' ? '/admin/loans' : '/loans';
          this.router.navigate([target]);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}