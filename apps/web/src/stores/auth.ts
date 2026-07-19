import { create } from 'zustand';
import type { AuthResponse, AuthUser, Session, Workspace } from '@devflow/shared';
import { queryClient } from '@/lib/queryClient';
import { clearPersistedCache } from '@/lib/persister';

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
  /** Adiciona (ou atualiza) um workspace na lista — ex.: ao criar ou aceitar convite. */
  addWorkspace: (workspace: Workspace, activate?: boolean) => void;
  /** Remove um workspace da lista (após excluir/sair) e reativa outro. */
  removeWorkspace: (id: string) => void;
  /** Renomeia um workspace na lista local. */
  renameWorkspace: (id: string, name: string) => void;
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

  addWorkspace: (workspace, activate = true) => {
    const { token, user, workspaces, activeWorkspaceId } = get();
    if (!token || !user) return;
    const exists = workspaces.some((w) => w.id === workspace.id);
    const nextWorkspaces = exists
      ? workspaces.map((w) => (w.id === workspace.id ? workspace : w))
      : [...workspaces, workspace];
    const nextActive = activate ? workspace.id : activeWorkspaceId;
    persist({
      token,
      user,
      workspaces: nextWorkspaces,
      activeWorkspaceId: nextActive ?? workspace.id,
    });
    if (activate) queryClient.clear();
    set({ workspaces: nextWorkspaces, activeWorkspaceId: nextActive });
  },

  removeWorkspace: (id) => {
    const { token, user, workspaces, activeWorkspaceId } = get();
    if (!token || !user) return;
    const nextWorkspaces = workspaces.filter((w) => w.id !== id);
    if (nextWorkspaces.length === 0) {
      // Não deveria acontecer (backend bloqueia o último), mas por segurança:
      get().logout();
      return;
    }
    const nextActive =
      activeWorkspaceId === id || !activeWorkspaceId
        ? nextWorkspaces[0].id
        : activeWorkspaceId;
    persist({ token, user, workspaces: nextWorkspaces, activeWorkspaceId: nextActive });
    queryClient.clear();
    set({ workspaces: nextWorkspaces, activeWorkspaceId: nextActive });
  },

  renameWorkspace: (id, name) => {
    const { token, user, workspaces, activeWorkspaceId } = get();
    if (!token || !user || !activeWorkspaceId) return;
    const nextWorkspaces = workspaces.map((w) =>
      w.id === id ? { ...w, name } : w,
    );
    persist({ token, user, workspaces: nextWorkspaces, activeWorkspaceId });
    set({ workspaces: nextWorkspaces });
  },

  logout: () => {
    persist(null);
    queryClient.clear();
    void clearPersistedCache();
    set({ token: null, user: null, workspaces: [], activeWorkspaceId: null });
  },
}));
