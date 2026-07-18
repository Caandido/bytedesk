import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Loader2, Bug, Wrench } from 'lucide-react';
import type { KnownError } from '@devflow/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import { ErrorDialog } from '@/features/errors/ErrorDialog';
import { useKnownErrors, useDeleteKnownError } from '@/features/errors/useErrors';

/** Banco de Erros: base pesquisável de erros conhecidos com motivo e solução. */
export function ErrosPage() {
  const errors = useKnownErrors();
  const deleteError = useDeleteKnownError();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KnownError | null>(null);

  const list = useMemo(() => errors.data ?? [], [errors.data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of list) if (e.category) set.add(e.category);
    return [...set].sort();
  }, [list]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((e) => {
      if (category !== 'ALL' && e.category !== category) return false;
      if (!term) return true;
      return [e.title, e.technology, e.category, ...e.tags]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [list, search, category]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (error: KnownError) => {
    setEditing(error);
    setDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, error: KnownError) => {
    e.stopPropagation();
    if (window.confirm(`Excluir o erro "${error.title}"?`)) {
      deleteError.mutate(error.id);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banco de Erros</h1>
          <p className="text-muted-foreground">
            Erros conhecidos, com motivo e solução — pesquisável.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" /> Novo erro
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por erro, tecnologia, categoria ou tag…"
            className="pl-9"
            aria-label="Buscar erros"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filtrar por categoria"
          className="sm:w-48"
        >
          <option value="ALL">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {errors.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      )}
      {errors.isError && (
        <p className="text-sm text-danger">Erro ao carregar o banco de erros.</p>
      )}

      {errors.isSuccess && list.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Bug className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhum erro registrado. Documente o primeiro erro conhecido.
            </p>
            <Button onClick={openNew}>
              <Plus className="size-4" /> Novo erro
            </Button>
          </CardContent>
        </Card>
      )}

      {errors.isSuccess && list.length > 0 && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum erro corresponde aos filtros.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((error) => (
          <Card
            key={error.id}
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => openEdit(error)}
          >
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-snug">{error.title}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-1 size-8 shrink-0"
                  aria-label={`Excluir ${error.title}`}
                  onClick={(e) => handleDelete(e, error)}
                  disabled={deleteError.isPending}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {error.technology && (
                  <Badge variant="info">{error.technology}</Badge>
                )}
                {error.category && (
                  <Badge variant="outline">{error.category}</Badge>
                )}
                {error.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {error.cause && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Motivo: </span>
                  {error.cause}
                </p>
              )}

              {error.solution && (
                <div className="rounded-md border border-border bg-background p-2">
                  <p className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
                    <Wrench className="size-3" /> Solução
                  </p>
                  <Markdown content={error.solution} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ErrorDialog
        open={dialogOpen}
        error={editing}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
