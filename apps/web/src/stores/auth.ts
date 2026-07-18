import { create } from 'zustand';
import type { AuthResponse, AuthUser, Session, Workspace } from '@devflow/shared';
import { queryClient } from '@/lib/queryClient';

/**
 * Sessão autenticada persistida em localStorage. O token e o workspace ativo são
 * lidos pelo `apiFetch` (fora do React, via `useAuthStore.getState()`) para injetar
 * nos headers de toda requisição.
 */

const STORAGE_KEY = 'devflow-auth';

interface PersistedAuth {
  token: string;
  user: AuthUser;
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

function readSaved(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAuth;
    if (!parsed.token || !parsed.activeWorkspaceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: PersistedAuth | null): void {
  try {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* localStorage indisponível */
  }
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  /** Aplica a resposta de login/registro (novo token + workspaces). */
  setAuth: (response: AuthResponse) => void;
  /** Atualiza usuário/workspaces a partir do GET /auth/me (mantém o token). */
  setSession: (session: Session) => void;
  /** Troca o workspace ativo e limpa o cache para recarregar os dados escopados. */
  setActiveWorkspace: (id: string) => void;
  /** Encerra a sessão e limpa o cache. */
  logout: () => void;
}

const saved = readSaved();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: saved?.token ?? null,
  user: saved?.user ?? null,
  workspaces: saved?.workspaces ?? [],
  activeWorkspaceId: saved?.activeWorkspaceId ?? null,

  setAuth: (response) => {
    persist({
      token: response.token,
      user: response.user,
      workspaces: response.workspaces,
      activeWorkspaceId: response.activeWorkspaceId,
    });
    queryClient.clear();
    set({
      token: response.token,
      user: response.user,
      workspaces: response.workspaces,
      activeWorkspaceId: response.activeWorkspaceId,
    });
  },

  setSession: (session) => {
    const token = get().token;
    if (!token) return;
    // Garante que o workspace ativo ainda existe (senão cai no primeiro).
    const current = get().activeWorkspaceId;
    const activeWorkspaceId =
      session.workspaces.find((w) => w.id === current)?.id ??
      session.workspaces[0]?.id ??
      null;
    if (!activeWorkspaceId) {
      get().logout();
      return;
    }
    persist({
      token,
      user: session.user,
      workspaces: session.workspaces,
      activeWorkspaceId,
    });
    set({ user: session.user, workspaces: session.workspaces, activeWorkspaceId });
  },

  setActiveWorkspace: (id) => {
    const { token, user, workspaces } = get();
    if (!token || !user) return;
    if (!workspaces.some((w) => w.id === id)) return;
    persist({ token, user, workspaces, activeWorkspaceId: id });
    queryClient.clear();
    set({ activeWorkspaceId: id });
  },

  logout: () => {
    persist(null);
    queryClient.clear();
    set({ token: null, user: null, workspaces: [], activeWorkspaceId: null });
  },
}));
