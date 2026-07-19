import * as vscode from 'vscode';
import { Api, Study, CodeFile } from './api';

export interface StudyNode {
  kind: 'login' | 'empty' | 'study' | 'code';
  item: vscode.TreeItem;
  study?: Study;
  code?: CodeFile;
}

/** Fornece a árvore de Estudos na barra lateral do ByteDesk. */
export class StudiesProvider implements vscode.TreeDataProvider<StudyNode> {
  private readonly _onDidChange = new vscode.EventEmitter<
    StudyNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(private readonly api: Api) {}

  refresh(): void {
    this._onDidChange.fire();
  }

  getTreeItem(node: StudyNode): vscode.TreeItem {
    return node.item;
  }

  async getChildren(node?: StudyNode): Promise<StudyNode[]> {
    const token = await this.api.token();
    if (!token) {
      const item = new vscode.TreeItem('Entrar no ByteDesk…');
      item.command = { command: 'bytedesk.login', title: 'Entrar' };
      item.iconPath = new vscode.ThemeIcon('sign-in');
      return [{ kind: 'login', item }];
    }

    // Raiz: lista de estudos.
    if (!node) {
      try {
        const studies = await this.api.studies();
        if (studies.length === 0) {
          const item = new vscode.TreeItem('Nenhum estudo — criar…');
          item.command = { command: 'bytedesk.newStudy', title: 'Novo estudo' };
          item.iconPath = new vscode.ThemeIcon('add');
          return [{ kind: 'empty', item }];
        }
        return studies.map((s) => {
          const hasCode = (s.codeFiles?.length ?? 0) > 0;
          const item = new vscode.TreeItem(
            s.name,
            hasCode
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
          );
          item.description = s.technology || s.status;
          item.iconPath = new vscode.ThemeIcon('mortar-board');
          item.contextValue = 'study';
          item.tooltip = `${s.name}${s.technology ? ` · ${s.technology}` : ''}`;
          return { kind: 'study', item, study: s };
        });
      } catch (err) {
        const item = new vscode.TreeItem(
          (err as Error).message || 'Erro ao carregar',
        );
        item.iconPath = new vscode.ThemeIcon('error');
        return [{ kind: 'empty', item }];
      }
    }

    // Filhos de um estudo: seus arquivos de código.
    if (node.kind === 'study' && node.study) {
      return (node.study.codeFiles ?? []).map((f) => {
        const item = new vscode.TreeItem(f.name);
        item.description = f.language;
        item.iconPath = new vscode.ThemeIcon('file-code');
        item.command = {
          command: 'bytedesk.openCode',
          title: 'Abrir código',
          arguments: [f],
        };
        return { kind: 'code', item, code: f };
      });
    }

    return [];
  }
}
