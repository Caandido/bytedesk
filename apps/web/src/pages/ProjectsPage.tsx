import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  FolderKanban,
  ListChecks,
  CalendarClock,
} from 'lucide-react';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
} from '@/features/projects/ProjectMeta';
import { useProjects, useDeleteProject } from '@/features/projects/useProjects';

type StatusFilter = ProjectStatus | 'ALL';
type PriorityFilter = ProjectPriority | 'ALL';
type SortKey = 'recent' | 'name' | 'deadline';

/**
 * Lista de projetos com busca (nome/cliente/tecnologias), filtros (status,
 * prioridade) e ordenação (recentes / nome / prazo), tudo no client.
 */
export function ProjectsPage() {
  const projects = useProjects();
  const deleteProject = useDeleteProject();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [priority, setPriority] = useState<PriorityFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('recent');

  const visible = useMemo(() => {
    const data = projects.data ?? [];
    const term = search.trim().toLowerCase();

    const filtered = data.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (priority !== 'ALL' && p.priority !== priority) return false;
      if (!term) return true;
      const haystack = [p.name, p.client, p.category, ...p.technologies]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'deadline': {
          // Projetos com prazo primeiro (mais próximo antes); sem prazo por último.
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return da - db;
        }
        case 'recent':
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [projects.data, search, status, priority, sort]);

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    if (window.confirm(`Excluir o projeto "${project.name}"?`)) {
      deleteProject.mutate(project.id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie projetos com visão geral, objetivos e links.
          </p>
        </div>
        <Link to="/projetos/novo" className={cn(buttonVariants(), 'shrink-0')}>
          <Plus className="size-4" /> Novo projeto
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cliente ou tecnologia…"
            className="pl-9"
            aria-label="Buscar projetos"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:w-auto">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por status"
          >
            <option value="ALL">Todos os status</option>
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityFilter)}
            aria-label="Filtrar por prioridade"
          >
            <option value="ALL">Toda prioridade</option>
            {Object.entries(PROJECT_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Ordenar"
          >
            <option value="recent">Mais recentes</option>
            <option value="name">Nome (A–Z)</option>
            <option value="deadline">Prazo</option>
          </Select>
        </div>
      </div>

      {projects.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando projetos…
        </p>
      )}
      {projects.isError && (
        <p className="text-sm text-danger">Erro ao carregar os projetos.</p>
      )}

      {projects.isSuccess && projects.data.length === 0 && <EmptyState />}

      {projects.isSuccess &&
        projects.data.length > 0 &&
        visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum projeto corresponde aos filtros.
          </p>
        )}

      {visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              deleting={deleteProject.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  deleting,
}: {
  project: Project;
  onDelete: (e: React.MouseEvent, project: Project) => void;
  deleting: boolean;
}) {
  const objectives = project.objectives ?? [];
  const done = objectives.filter((o) => o.done).length;

  return (
    <Link to={`/projetos/${project.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold leading-tight">
                {project.name}
              </h3>
              {project.client && (
                <p className="truncate text-xs text-muted-foreground">
                  {project.client}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 -mt-2 size-8 shrink-0"
              aria-label={`Excluir ${project.name}`}
              onClick={(e) => onDelete(e, project)}
              disabled={deleting}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <ProjectStatusBadge status={project.status} />
            <ProjectPriorityBadge priority={project.priority} />
            {project.version && (
              <Badge variant="outline">v{project.version}</Badge>
            )}
          </div>

          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="default">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 4 && (
                <Badge variant="default">
                  +{project.technologies.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            {objectives.length > 0 && (
              <span className="flex items-center gap-1">
                <ListChecks className="size-3.5" />
                {done}/{objectives.length}
              </span>
            )}
            {project.deadline && (
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5" />
                {new Date(project.deadline).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <FolderKanban className="size-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          Você ainda não tem projetos. Crie o primeiro para começar.
        </p>
        <Link to="/projetos/novo" className={buttonVariants()}>
          <Plus className="size-4" /> Novo projeto
        </Link>
      </CardContent>
    </Card>
  );
}
