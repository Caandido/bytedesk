import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Trash2, Loader2, Lightbulb } from 'lucide-react';
import {
  IDEA_STATUS_LABELS,
  IDEA_RATING_LABELS,
  type Idea,
  type IdeaStatus,
  type IdeaRating,
} from '@devflow/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { IdeaDialog } from '@/features/ideas/IdeaDialog';
import { useIdeas, useDeleteIdea } from '@/features/ideas/useIdeas';
import type { ProjectOutletContext } from './ProjectLayout';

type StatusFilter = IdeaStatus | 'ALL';

const STATUS_VARIANT: Record<IdeaStatus, BadgeProps['variant']> = {
  NEW: 'info',
  CONSIDERING: 'warning',
  PLANNED: 'primary',
  DONE: 'default',
  DISCARDED: 'outline',
};

const RATING_VARIANT: Record<IdeaRating, BadgeProps['variant']> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
};

/** Aba "Ideias": banco de ideias do projeto com busca, filtro e CRUD. */
export function ProjectIdeasPage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const ideas = useIdeas(projectId);
  const deleteIdea = useDeleteIdea(projectId);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);

  const visible = useMemo(() => {
    const data = ideas.data ?? [];
    const term = search.trim().toLowerCase();
    return data.filter((i) => {
      if (status !== 'ALL' && i.status !== status) return false;
      if (!term) return true;
      return [i.title, ...i.tags].join(' ').toLowerCase().includes(term);
    });
  }, [ideas.data, search, status]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (idea: Idea) => {
    setEditing(idea);
    setDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    if (window.confirm(`Excluir a ideia "${idea.title}"?`)) {
      deleteIdea.mutate(idea.id);
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
            placeholder="Buscar por título ou tag…"
            className="pl-9"
            aria-label="Buscar ideias"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filtrar por status"
          className="sm:w-44"
        >
          <option value="ALL">Todos os status</option>
          {Object.entries(IDEA_STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" /> Nova ideia
        </Button>
      </div>

      {ideas.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando ideias…
        </p>
      )}
      {ideas.isError && (
        <p className="text-sm text-danger">Erro ao carregar as ideias.</p>
      )}

      {ideas.isSuccess && ideas.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Lightbulb className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhuma ideia registrada. Capture a primeira.
            </p>
            <Button onClick={openNew}>
              <Plus className="size-4" /> Nova ideia
            </Button>
          </CardContent>
        </Card>
      )}

      {ideas.isSuccess && ideas.data.length > 0 && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma ideia corresponde aos filtros.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((idea) => (
          <Card
            key={idea.id}
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => openEdit(idea)}
          >
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 shrink-0 text-warning" />
                  <p className="font-medium leading-snug">{idea.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-1 size-8 shrink-0"
                  aria-label={`Excluir ${idea.title}`}
                  onClick={(e) => handleDelete(e, idea)}
                  disabled={deleteIdea.isPending}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </div>

              {idea.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {idea.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5">
                <Badge variant={STATUS_VARIANT[idea.status]}>
                  {IDEA_STATUS_LABELS[idea.status]}
                </Badge>
                <Badge variant={RATING_VARIANT[idea.priority]}>
                  Prio: {IDEA_RATING_LABELS[idea.priority]}
                </Badge>
                <Badge variant={RATING_VARIANT[idea.impact]}>
                  Impacto: {IDEA_RATING_LABELS[idea.impact]}
                </Badge>
                <Badge variant={RATING_VARIANT[idea.complexity]}>
                  Compl.: {IDEA_RATING_LABELS[idea.complexity]}
                </Badge>
              </div>

              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <IdeaDialog
        projectId={projectId}
        open={dialogOpen}
        idea={editing}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
