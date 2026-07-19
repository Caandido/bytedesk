import * as vscode from 'vscode';
import * as path from 'path';
import { Api, siteUrl, type CodeFile, type Study, type Workspace } from './api';
import { StudiesProvider } from './studiesProvider';

export function activate(context: vscode.ExtensionContext): void {
  const api = new Api(context);
  const provider = new StudiesProvider(api);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('bytedesk.studies', provider),
  );

  const reg = (command: string, cb: (...args: unknown[]) => unknown) =>
    context.subscriptions.push(vscode.commands.registerCommand(command, cb));

  // ── Entrar / Sair ──────────────────────────────────────────────────────────
  reg('bytedesk.login', async () => {
    const email = await vscode.window.showInputBox({
      prompt: 'E-mail do ByteDesk',
      ignoreFocusOut: true,
      placeHolder: 'voce@exemplo.com',
    });
    if (!email) return;
    const password = await vscode.window.showInputBox({
      prompt: 'Senha',
      password: true,
      ignoreFocusOut: true,
    });
    if (!password) return;

    try {
      const res = await api.login(email.trim(), password);
      await api.setToken(res.token);
      let activeId = res.activeWorkspaceId;
      if (res.workspaces.length > 1) {
        activeId = (await pickWorkspace(res.workspaces)) ?? activeId;
      }
      await api.setWorkspaceId(activeId);
      provider.refresh();
      vscode.window.showInformationMessage(
        `ByteDesk: conectado como ${res.user.name || res.user.email}.`,
      );
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  reg('bytedesk.logout', async () => {
    await api.setToken(undefined);
    await api.setWorkspaceId(undefined);
    provider.refresh();
    vscode.window.showInformationMessage('ByteDesk: sessão encerrada.');
  });

  reg('bytedesk.selectWorkspace', async () => {
    if (!(await api.token())) {
      vscode.window.showWarningMessage('ByteDesk: entre primeiro.');
      return;
    }
    try {
      const { workspaces } = await api.me();
      const chosen = await pickWorkspace(workspaces);
      if (chosen) {
        await api.setWorkspaceId(chosen);
        provider.refresh();
      }
    } catch (err) {
      vscode.window.showErrorMessage(`ByteDesk: ${(err as Error).message}`);
    }
  });

  // ── Salvar seleção como código ─────────────────────────────────────────────
  reg('bytedesk.saveSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('ByteDesk: nenhum editor aberto.');
      return;
    }
    if (!(await api.token())) {
      vscode.window.showWarningMessage('ByteDesk: entre primeiro (ByteDesk: Entrar).');
      return;
    }
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

  // ── Novo estudo ────────────────────────────────────────────────────────────
  reg('bytedesk.newStudy', async () => {
    if (!(await api.token())) {
      vscode.window.showWarningMessage('ByteDesk: entre primeiro.');
      return;
    }
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

  // ── Abrir código num editor / abrir estudo no site ─────────────────────────
  reg('bytedesk.openCode', async (arg: unknown) => {
    const code = arg as CodeFile;
    if (!code?.content && code?.content !== '') return;
    const doc = await vscode.workspace.openTextDocument({
      content: code.content,
      language: code.language || undefined,
    });
    await vscode.window.showTextDocument(doc, { preview: true });
  });

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

async function pickWorkspace(
  workspaces: Workspace[],
): Promise<string | undefined> {
  const pick = await vscode.window.showQuickPick(
    workspaces.map((w) => ({
      label: w.name,
      description: w.role.toLowerCase(),
      id: w.id,
    })),
    { placeHolder: 'Escolha o workspace ativo', ignoreFocusOut: true },
  );
  return pick?.id;
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
    { placeHolder: 'Salvar o código em qual estudo?', ignoreFocusOut: true },
  );
  return pick?.study;
}
