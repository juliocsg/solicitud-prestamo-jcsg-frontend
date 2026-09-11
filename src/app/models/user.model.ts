export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  id: number;
  name: string;
  email: string;
  role: Role;
}