import { apiFetch } from '@/services/api';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  Session,
} from '@devflow/shared';

/** Chamadas à API de autenticação (register/login públicos; me protegido). */
export const authApi = {
  register: (input: RegisterInput) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: LoginInput) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => apiFetch<Session>('/auth/me'),
};
