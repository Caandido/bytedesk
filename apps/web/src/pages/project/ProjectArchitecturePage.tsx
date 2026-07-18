import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Pencil,
  Loader2,
  Plus,
  Trash2,
  FolderTree,
  Package,
  Network,
  Eye,
} from 'lucide-react';
import type { Dependency } from '@devflow/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import {
  useArchitecture,
  useSaveArchitecture,
} from '@/features/architecture/useArchitecture';
import type { ProjectOutletContext } from './ProjectLayout';

/**
 * Aba "Arquitetura": documento com diagramas (Mermaid), estrutura de pastas e
 * dependências. Um único modo de edição salva as três seções de uma vez.
 */
export function ProjectArchitecturePage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const architecture = useArchitecture(projectId);
  const save = useSaveArchitecture(projectId);

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [folders, setFolders] = useState('');
  const [deps, setDeps] = useState<Dependency[]>([]);

  const data = architecture.data;

  useEffect(() => {
    if (editing && data) {
      setContent(data.content);
      setFolders(data.folderStructure);
      setDeps(data.dependencies);
    }
  }, [editing, data]);

  if (architecture.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (architecture.isError || !data) {
    return <p className="text-sm text-danger">Erro ao carregar a arquitetura.</p>;
  }

  const handleSave = () => {
    save.mutate(
      {
        content,
        folderStructure: folders,
        dependencies: deps.filter((d) => d.name.trim()),
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const isEmpty =
    !data.content.trim() &&
    !data.folderStructure.trim() &&
    data.dependencies.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {editing ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-4" /> Editar
          </Button>
        )}
      </div>

      {!editing && isEmpty && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Network className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Documente a arquitetura: diagramas (Mermaid), estrutura de pastas e
              dependências.
            </p>
            <Button onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Editar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documento / diagramas */}
      {(editing || data.content.trim()) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="size-4" /> Diagramas e visão de arquitetura
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="font-mono text-xs"
                  placeholder={
                    'Markdown com diagramas Mermaid, ex.:\n\n```mermaid\ngraph TD\n  Cliente --> API --> Banco\n```'
                  }
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="size-3.5" /> Suporta Markdown + diagramas
                  Mermaid (```mermaid).
                </p>
              </div>
            ) : (
              <Markdown content={data.content} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Estrutura de pastas */}
      {(editing || data.folderStructure.trim()) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="size-4" /> Estrutura de pastas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={folders}
                onChange={(e) => setFolders(e.target.value)}
                rows={8}
                className="font-mono text-xs"
                placeholder={'src/\n  app/\n  components/\n  features/'}
              />
            ) : (
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs">
                {data.folderStructure}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dependências */}
      {(editing || data.dependencies.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" /> Dependências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {editing ? (
              <>
                {deps.map((dep, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={dep.name}
                      onChange={(e) =>
                        setDeps((ds) =>
                          ds.map((d, idx) =>
                            idx === i ? { ...d, name: e.target.value } : d,
                          ),
                        )
                      }
                      placeholder="pacote"
                      className="flex-1"
                    />
                    <Input
                      value={dep.version ?? ''}
                      onChange={(e) =>
                        setDeps((ds) =>
                          ds.map((d, idx) =>
                            idx === i ? { ...d, version: e.target.value } : d,
                          ),
                        )
                      }
                      placeholder="versão"
                      className="w-28"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover dependência"
                      onClick={() =>
                        setDeps((ds) => ds.filter((_, idx) => idx !== i))
                      }
                    >
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeps((ds) => [...ds, { name: '', version: '' }])}
                >
                  <Plus className="size-4" /> Adicionar dependência
                </Button>
              </>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {data.dependencies.map((dep, i) => (
                  <Badge key={i} variant="outline">
                    {dep.name}
                    {dep.version ? ` @ ${dep.version}` : ''}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
