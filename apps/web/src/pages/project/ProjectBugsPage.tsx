import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Trash2, Loader2, Bug as BugIcon, Wrench } from 'lucide-react';
import {
  BUG_STATUS_LABELS,
  BUG_SEVERITY_LABELS,
  type Bug,
  type BugStatus,
  type BugSeverity,
} from '@devflow/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BugSeverityBadge, BugStatusBadge } from '@/features/bugs/BugMeta';
import { BugDialog } from '@/features/bugs/BugDialog';
import { useBugs, useDeleteBug } from '@/features/bugs/useBugs';
import type { ProjectOutletContext } from './ProjectLayout';

type StatusFilter = BugStatus | 'ALL';
type SeverityFilter = BugSeverity | 'ALL';

/** Aba "Bugs": lista com busca (título/módulo), filtros (status, severidade) e CRUD. */
export function ProjectBugsPage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const bugs = useBugs(projectId);
  const deleteBug = useDeleteBug(projectId);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [severity, setSeverity] = useState<SeverityFilter>('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);

  const visible = useMemo(() => {
    const data = bugs.data ?? [];
    const term = search.trim().toLowerCase();
    return data.filter((b) => {
      if (status !== 'ALL' && b.status !== status) return false;
      if (severity !== 'ALL' && b.severity !== severity) return false;
      if (!term) return true;
      return [b.title, b.module, b.version]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [bugs.data, search, status, severity]);

  const openNew = () => {
    setEditingBug(null);
    setDialogOpen(true);
  };
  const openEdit = (bug: Bug) => {
    setEditingBug(bug);
    setDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, bug: Bug) => {
    e.stopPropagation();
    if (window.confirm(`Excluir o bug "${bug.title}"?`)) {
      deleteBug.mutate(bug.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, módulo ou versão…"
            className="pl-9"
            aria-label="Buscar bugs"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filtrar por status"
          className="sm:w-44"
        >
          <option value="ALL">Todos os status</option>
          {Object.entries(BUG_STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
          aria-label="Filtrar por severidade"
          className="sm:w-40"
        >
          <option value="ALL">Toda severidade</option>
          {Object.entries(BUG_SEVERITY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" /> Novo bug
        </Button>
      </div>

      {bugs.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando bugs…
        </p>
      )}
      {bugs.isError && (
        <p className="text-sm text-danger">Erro ao carregar os bugs.</p>
      )}

      {bugs.isSuccess && bugs.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <BugIcon className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhum bug registrado neste projeto.
            </p>
            <Button onClick={openNew}>
              <Plus className="size-4" /> Novo bug
            </Button>
          </CardContent>
        </Card>
      )}

      {bugs.isSuccess && bugs.data.length > 0 && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum bug corresponde aos filtros.
        </p>
      )}

      <div className="space-y-2">
        {visible.map((bug) => (
          <Card
            key={bug.id}
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => openEdit(bug)}
          >
            <CardContent className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0 space-y-1.5">
                <p className="font-medium leading-snug">{bug.title}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <BugStatusBadge status={bug.status} />
                  <BugSeverityBadge severity={bug.severity} />
                  {bug.module && <Badge variant="outline">{bug.module}</Badge>}
                  {bug.version && (
                    <Badge variant="default">v{bug.version}</Badge>
                  )}
                  {bug.fixedBy && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Wrench className="size-3" /> {bug.fixedBy}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={`Excluir ${bug.title}`}
                onClick={(e) => handleDelete(e, bug)}
                disabled={deleteBug.isPending}
              >
                <Trash2 className="size-4 text-danger" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <BugDialog
        projectId={projectId}
        open={dialogOpen}
        bug={editingBug}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
