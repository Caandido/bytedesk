import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Project } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
} from '@/features/projects/ProjectMeta';
import { useProject, useDeleteProject } from '@/features/projects/useProjects';

/** Contexto do Outlet: o projeto carregado, consumido pelas abas. */
export interface ProjectOutletContext {
  project: Project;
}

const tabs = [
  { to: '', label: 'Visão geral', end: true },
  { to: 'tarefas', label: 'Tarefas', end: false },
  { to: 'bugs', label: 'Bugs', end: false },
  { to: 'docs', label: 'Documentação', end: false },
];

/**
 * Layout do detalhe de um projeto: carrega o projeto uma vez, exibe o cabeçalho e a
 * navegação por abas, e entrega o projeto às abas (Visão geral, Tarefas) via Outlet.
 */
export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useProject(id);
  const deleteProject = useDeleteProject();

  if (project.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (project.isError || !project.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">Projeto não encontrado.</p>
        <Link to="/projetos" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>
    );
  }

  const p = project.data;

  const handleDelete = () => {
    if (window.confirm(`Excluir o projeto "${p.name}"?`)) {
      deleteProject.mutate(p.id, { onSuccess: () => navigate('/projetos') });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            to="/projetos"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
            {p.client && (
              <p className="text-sm text-muted-foreground">{p.client}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <ProjectStatusBadge status={p.status} />
              <ProjectPriorityBadge priority={p.priority} />
              {p.version && <Badge variant="outline">v{p.version}</Badge>}
              {p.category && <Badge variant="default">{p.category}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to={`/projetos/${p.id}/editar`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Pencil className="size-4" /> Editar
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
          >
            <Trash2 className="size-4 text-danger" />
          </Button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to ? `/projetos/${p.id}/${tab.to}` : `/projetos/${p.id}`}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ project: p } satisfies ProjectOutletContext} />
    </div>
  );
}
