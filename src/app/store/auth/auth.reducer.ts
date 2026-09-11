import { createReducer, on } from '@ngrx/store';
import { initialAuthState, AuthState } from './auth.state';
import { login, loginSuccess, loginFailure, logout, loadUserFromStorage } from './auth.actions';
import { User } from '../../models/user.model';

function userFromStorage(): User | null {
  const data = localStorage.getItem('auth_user');
  return data ? JSON.parse(data) : null;
}

export const authReducer = createReducer(
  initialAuthState,

  on(loadUserFromStorage, (state): AuthState => {
    const user = userFromStorage();
    return {
      ...state,
      user,
      isAuthenticated: !!user,
      error: null
    };
  }),

  on(login, (state): AuthState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loginSuccess, (state, { response }): AuthState => ({
    ...state,
    loading: false,
    isAuthenticated: true,
    user: {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role
    },
    error: null
  })),

  on(loginFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    isAuthenticated: false,
    user: null,
    error
  })),

  on(logout, (): AuthState => ({
    ...initialAuthState
  }))
);