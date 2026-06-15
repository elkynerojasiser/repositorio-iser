import { apiFetch } from './client';
import type { LoginResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}
