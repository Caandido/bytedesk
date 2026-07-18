import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Loader2,
  Eye,
} from 'lucide-react';
import type { ProjectDoc } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Markdown } from '@/components/Markdown';
import {
  useDocs,
  useCreateDoc,
  useUpdateDoc,
  useDeleteDoc,
} from '@/features/docs/useDocs';
import type { ProjectOutletContext } from './ProjectLayout';

/** Aba "Documentação": páginas em Markdown do projeto (lista + editor). */
export function ProjectDocsPage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const docs = useDocs(projectId);
  const createDoc = useCreateDoc(projectId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const list = useMemo(() => docs.data ?? [], [docs.data]);
  const selected = list.find((d) => d.id === selectedId) ?? null;

  // Seleciona a primeira página quando a lista carrega/muda.
  useEffect(() => {
    if (list.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !list.some((d) => d.id === selectedId)) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  const handleCreate = () => {
    createDoc.mutate(
      { title: 'Nova página' },
      {
        onSuccess: (doc) => {
          setSelectedId(doc.id);
          setEditing(true);
        },
      },
    );
  };

  if (docs.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando documentação…
      </p>
    );
  }
  if (docs.isError) {
    return <p className="text-sm text-danger">Erro ao carregar a documentação.</p>;
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="size-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            Nenhuma página de documentação ainda.
          </p>
          <Button onClick={handleCreate} disabled={createDoc.isPending}>
            <Plus className="size-4" /> Nova página
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      {/* Lista de páginas */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCreate}
          disabled={createDoc.isPending}
        >
          <Plus className="size-4" /> Nova página
        </Button>
        <nav className="space-y-1">
          {list.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                setSelectedId(doc.id);
                setEditing(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 truncate rounded-md px-3 py-2 text-left text-sm transition-colors',
                doc.id === selectedId
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{doc.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Editor / visualização */}
      {selected && (
        <DocEditor
          key={selected.id}
          projectId={projectId}
          doc={selected}
          editing={editing}
          onEditingChange={setEditing}
          onDeleted={() => {
            setEditing(false);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Editor de uma página ────────────────────────────────────────────────────

function DocEditor({
  projectId,
  doc,
  editing,
  onEditingChange,
  onDeleted,
}: {
  projectId: string;
  doc: ProjectDoc;
  editing: boolean;
  onEditingChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const updateDoc = useUpdateDoc(projectId);
  const deleteDoc = useDeleteDoc(projectId);

  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);

  // Sincroniza o rascunho ao entrar em edição.
  useEffect(() => {
    if (editing) {
      setTitle(doc.title);
      setContent(doc.content);
    }
  }, [editing, doc.title, doc.content]);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateDoc.mutate(
      { docId: doc.id, input: { title: trimmed, content } },
      { onSuccess: () => onEditingChange(false) },
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Excluir a página "${doc.title}"?`)) {
      deleteDoc.mutate(doc.id, { onSuccess: onDeleted });
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          {editing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da página"
              maxLength={200}
              className="max-w-sm text-base font-semibold"
            />
          ) : (
            <h2 className="text-lg font-semibold">{doc.title}</h2>
          )}

          <div className="flex shrink-0 gap-2">
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditingChange(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={save} disabled={updateDoc.isPending}>
                  {updateDoc.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditingChange(true)}
                >
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteDoc.isPending}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva em Markdown… (títulos, listas, `código`, tabelas, imagens)"
              rows={18}
              className="font-mono text-xs"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> Markdown (GFM): títulos, listas,
              checklists, tabelas, código, links e imagens.
            </p>
          </div>
        ) : doc.content.trim() ? (
          <Markdown content={doc.content} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Página vazia. Clique em “Editar” para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
