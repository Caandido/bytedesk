import { useAuthStore } from '@/stores/auth';

/**
 * Cliente HTTP base da aplicação. Em dev, o Vite faz proxy de `/api` para o
 * backend NestJS (ver vite.config.ts), então usamos caminhos relativos.
 *
 * Toda requisição carrega automaticamente a sessão autenticada: o token JWT
 * (`Authorization: Bearer`) e o workspace ativo (`x-workspace-id`), lidos do
 * `useAuthStore`. Em caso de 401, a sessão é encerrada (o guard de rota redireciona
 * para o login).
 */

const API_BASE = '/api';

/** Extrai a mensagem legível do corpo de erro do Nest (`{ message }`) ou usa o texto cru. */
function extractMessage(body: string): string {
  if (!body) return '';
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
    if (typeof parsed.message === 'string') return parsed.message;
  } catch {
    /* corpo não-JSON */
  }
  return body;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { token, activeWorkspaceId } = useAuthStore.getState();

  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (activeWorkspaceId) {
    headers.set('x-workspace-id', activeWorkspaceId);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    // Token ausente/expirado: encerra a sessão (o RequireAuth leva ao login).
    useAuthStore.getState().logout();
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, extractMessage(body) || response.statusText);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
