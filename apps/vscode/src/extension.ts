import * as vscode from 'vscode';
import * as path from 'path';
import { Api, siteUrl, type CodeFile, type Study } from './api';
import { StudiesProvider } from './studiesProvider';

export function activate(context: vscode.ExtensionContext): void {
  const api = new Api(context);
  const provider = new StudiesProvider(api);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('bytedesk.studies', provider),
  );

  const reg = (command: string, cb: (...args: unknown[]) => unknown) =>
    context.subscriptions.push(vscode.commands.registerCommand(command, cb));

  // ── Entrar (token de API) / Sair ───────────────────────────────────────────
  reg('bytedesk.login', async () => {
    const token = await vscode.window.showInputBox({
      prompt: 'Cole seu token de API do ByteDesk',
      placeHolder: 'bd_…',
      password: true,
      ignoreFocusOut: true,
      title: 'ByteDesk — gere o token em: Membros e tokens (no app)',
    });
    if (!token) return;
    await api.setToken(token.trim());
    try {
      await api.studies(); // valida o token
      provider.refresh();
      vscode.window.showInformationMessage('ByteDesk: conectado.');
    } catch (err) {
      await api.setToken(undefined);
      provider.refresh();
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  reg('bytedesk.logout', async () => {
    await api.setToken(undefined);
    provider.refresh();
    vscode.window.showInformationMessage('ByteDesk: sessão encerrada.');
  });

  // ── Salvar seleção como código ─────────────────────────────────────────────
  reg('bytedesk.saveSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('ByteDesk: nenhum editor aberto.');
      return;
    }
    if (!(await requireAuth(api))) return;

    const sel = editor.selection;
    const content = sel.isEmpty
      ? editor.document.getText()
      : editor.document.getText(sel);
    if (!content.trim()) {
      vscode.window.showWarningMessage('ByteDesk: nada selecionado.');
      return;
    }

    const study = await pickStudy(api);
    if (!study) return;

    const defaultName = editor.document.isUntitled
      ? 'trecho.txt'
      : path.basename(editor.document.fileName);
    const name = await vscode.window.showInputBox({
      prompt: 'Nome do arquivo de código',
      value: defaultName,
      ignoreFocusOut: true,
    });
    if (!name) return;

    try {
      await api.addCode(study.id, name.trim(), editor.document.languageId, content);
      provider.refresh();
      vscode.window.showInformationMessage(
        `ByteDesk: código salvo em "${study.name}".`,
      );
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  // ── Nova anotação rápida (vira uma seção do estudo) ────────────────────────
  reg('bytedesk.quickNote', async () => {
    if (!(await requireAuth(api))) return;
    const editor = vscode.window.activeTextEditor;
    const prefill =
      editor && !editor.selection.isEmpty
        ? editor.document.getText(editor.selection)
        : '';
    const note = await vscode.window.showInputBox({
      prompt: 'Anotação rápida',
      value: prefill,
      ignoreFocusOut: true,
      placeHolder: 'O que você quer anotar?',
    });
    if (!note || !note.trim()) return;

    const study = await pickStudy(api);
    if (!study) return;

    const title = `Anotação — ${new Date().toLocaleDateString('pt-BR')}`;
    try {
      await api.addSection(study.id, title, note);
      provider.refresh();
      vscode.window.showInformationMessage(
        `ByteDesk: anotação salva em "${study.name}".`,
      );
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  // ── Novo estudo ────────────────────────────────────────────────────────────
  reg('bytedesk.newStudy', async () => {
    if (!(await requireAuth(api))) return;
    const name = await vscode.window.showInputBox({
      prompt: 'Nome do novo estudo',
      ignoreFocusOut: true,
    });
    if (!name) return;
    try {
      await api.createStudy(name.trim());
      provider.refresh();
      vscode.window.showInformationMessage(`ByteDesk: estudo "${name}" criado.`);
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  reg('bytedesk.refresh', () => provider.refresh());

  // ── Abrir código num editor ────────────────────────────────────────────────
  reg('bytedesk.openCode', async (arg: unknown) => {
    const code = arg as CodeFile | undefined;
    if (!code || typeof code.content !== 'string') return;
    const doc = await vscode.workspace.openTextDocument({
      content: code.content,
      language: code.language || undefined,
    });
    await vscode.window.showTextDocument(doc, { preview: true });
  });

  // ── Ver estudo num painel (webview) ────────────────────────────────────────
  reg('bytedesk.viewStudy', async (arg: unknown) => {
    if (!(await requireAuth(api))) return;
    const fromTree = arg as { study?: Study } | undefined;
    const chosen = fromTree?.study ?? (await pickStudy(api));
    if (!chosen) return;
    try {
      const full = await api.study(chosen.id);
      showStudyPanel(full);
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  // ── Abrir estudo no site (navegador) ───────────────────────────────────────
  reg('bytedesk.openStudy', async (arg: unknown) => {
    const node = arg as { study?: Study } | undefined;
    if (!node?.study) return;
    await vscode.env.openExternal(
      vscode.Uri.parse(`${siteUrl()}/estudos/${node.study.id}`),
    );
  });
}

export function deactivate(): void {
  /* nada a limpar */
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function requireAuth(api: Api): Promise<boolean> {
  if (await api.token()) return true;
  vscode.window.showWarningMessage('ByteDesk: entre primeiro (ByteDesk: Entrar).');
  return false;
}

async function pickStudy(api: Api): Promise<Study | undefined> {
  let studies: Study[];
  try {
    studies = await api.studies();
  } catch (err) {
    vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    return undefined;
  }
  if (studies.length === 0) {
    vscode.window.showWarningMessage(
      'ByteDesk: nenhum estudo. Crie um com "ByteDesk: Novo estudo".',
    );
    return undefined;
  }
  const pick = await vscode.window.showQuickPick(
    studies.map((s) => ({
      label: s.name,
      description: s.technology || s.status,
      study: s,
    })),
    { placeHolder: 'Escolha o estudo', ignoreFocusOut: true },
  );
  return pick?.study;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showStudyPanel(study: Study): void {
  const panel = vscode.window.createWebviewPanel(
    'bytedesk.study',
    `ByteDesk · ${study.name}`,
    vscode.ViewColumn.Beside,
    { enableScripts: false },
  );
  const notes = study.notes?.trim()
    ? `<h2>Anotações</h2><pre class="box">${escapeHtml(study.notes)}</pre>`
    : '';
  const sections = (study.sections ?? [])
    .map(
      (sec) =>
        `<h3>${escapeHtml(sec.title)}</h3><pre class="box">${escapeHtml(sec.content)}</pre>`,
    )
    .join('');
  const code = (study.codeFiles ?? [])
    .map(
      (f) =>
        `<h3>${escapeHtml(f.name)} <span class="lang">${escapeHtml(f.language)}</span></h3><pre class="code">${escapeHtml(f.content)}</pre>`,
    )
    .join('');
  panel.webview.html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
  h1 { font-size: 1.4em; }
  h2 { margin-top: 1.4em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 4px; }
  .lang { font-size: .7em; color: var(--vscode-descriptionForeground); }
  .box, .code { background: var(--vscode-textCodeBlock-background); padding: 10px; border-radius: 6px; white-space: pre-wrap; overflow-x: auto; }
  .code { font-family: var(--vscode-editor-font-family); font-size: 12px; white-space: pre; }
  .meta { color: var(--vscode-descriptionForeground); }
</style></head><body>
  <h1>${escapeHtml(study.name)}</h1>
  <p class="meta">${escapeHtml(study.technology || '')} ${study.technology ? '·' : ''} ${escapeHtml(study.status)}</p>
  ${notes}
  ${sections ? `<h2>Seções</h2>${sections}` : ''}
  ${code ? `<h2>Códigos</h2>${code}` : ''}
</body></html>`;
}
