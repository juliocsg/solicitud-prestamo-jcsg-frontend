import { createAction, props } from '@ngrx/store';
import { LoginResponse, User } from '../../models/user.model';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: LoginResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const loadUserFromStorage = createAction('[Auth] Load User From Storage');

export const logout = createAction('[Auth] Logout');