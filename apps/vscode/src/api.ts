import * as vscode from 'vscode';

const TOKEN_KEY = 'bytedesk.token';
const WS_KEY = 'bytedesk.workspaceId';

export interface Workspace {
  id: string;
  name: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  user: { name: string; email: string };
  workspaces: Workspace[];
  activeWorkspaceId: string;
}
export interface Session {
  user: { name: string; email: string };
  workspaces: Workspace[];
}
export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}
export interface Study {
  id: string;
  name: string;
  technology: string;
  status: string;
  codeFiles?: CodeFile[];
}

/** URL base da API (configurável). */
export function apiUrl(): string {
  return (
    vscode.workspace.getConfiguration('bytedesk').get<string>('apiUrl') ||
    'https://bytedesk-two.vercel.app/api'
  );
}

/** URL do site (deriva da API removendo o /api final). */
export function siteUrl(): string {
  return apiUrl().replace(/\/api\/?$/, '');
}

function extractMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
    if (typeof parsed.message === 'string') return parsed.message;
  } catch {
    /* corpo não-JSON */
  }
  return body;
}

/** Cliente da API do ByteDesk. Token no SecretStorage; workspace no globalState. */
export class Api {
  constructor(private readonly ctx: vscode.ExtensionContext) {}

  token(): Thenable<string | undefined> {
    return this.ctx.secrets.get(TOKEN_KEY);
  }
  async setToken(token: string | undefined): Promise<void> {
    if (token) await this.ctx.secrets.store(TOKEN_KEY, token);
    else await this.ctx.secrets.delete(TOKEN_KEY);
  }
  workspaceId(): string | undefined {
    return this.ctx.globalState.get<string>(WS_KEY);
  }
  async setWorkspaceId(id: string | undefined): Promise<void> {
    await this.ctx.globalState.update(WS_KEY, id);
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.auth !== false) {
      const token = await this.token();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const ws = this.workspaceId();
      if (ws) headers['x-workspace-id'] = ws;
    }
    const res = await fetch(apiUrl() + path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (res.status === 401) {
      await this.setToken(undefined);
      throw new Error('Sessão expirada. Entre novamente (ByteDesk: Entrar).');
    }
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(extractMessage(txt) || res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  }
  me(): Promise<Session> {
    return this.request<Session>('/auth/me');
  }
  studies(): Promise<Study[]> {
    return this.request<Study[]>('/studies');
  }
  createStudy(name: string): Promise<Study> {
    return this.request<Study>('/studies', { method: 'POST', body: { name } });
  }
  addCode(
    studyId: string,
    name: string,
    language: string,
    content: string,
  ): Promise<CodeFile> {
    return this.request<CodeFile>(`/studies/${studyId}/code`, {
      method: 'POST',
      body: { name, language, content },
    });
  }
}
