import * as vscode from 'vscode';

const TOKEN_KEY = 'bytedesk.token';

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}
export interface Section {
  id: string;
  title: string;
  content: string;
}
export interface Study {
  id: string;
  name: string;
  technology: string;
  status: string;
  notes?: string;
  codeFiles?: CodeFile[];
  sections?: Section[];
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

/**
 * Cliente da API do ByteDesk. Autentica por **token de API** (`bd_...`) guardado
 * no SecretStorage — o token já embute o workspace, então não precisa do header
 * de workspace nem de login por senha.
 */
export class Api {
  constructor(private readonly ctx: vscode.ExtensionContext) {}

  token(): Thenable<string | undefined> {
    return this.ctx.secrets.get(TOKEN_KEY);
  }
  async setToken(token: string | undefined): Promise<void> {
    if (token) await this.ctx.secrets.store(TOKEN_KEY, token);
    else await this.ctx.secrets.delete(TOKEN_KEY);
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const token = await this.token();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(apiUrl() + path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (res.status === 401) {
      await this.setToken(undefined);
      throw new Error('Token inválido ou revogado. Entre novamente.');
    }
    if (!res.ok) {
      throw new Error(extractMessage(await res.text()) || res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  studies(): Promise<Study[]> {
    return this.request<Study[]>('/studies');
  }
  study(id: string): Promise<Study> {
    return this.request<Study>(`/studies/${id}`);
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
  addSection(studyId: string, title: string, content: string): Promise<Section> {
    return this.request<Section>(`/studies/${studyId}/sections`, {
      method: 'POST',
      body: { title, content },
    });
  }
}
