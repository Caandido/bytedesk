import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  CalendarClock,
  Github,
  Figma,
  Rocket,
  BookText,
  type LucideIcon,
} from 'lucide-react';
import type { Project } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import { ObjectiveChecklist } from '@/components/ObjectiveChecklist';
import {
  ProjectStatusBadge,
  ProjectPriorityBadge,
} from '@/features/projects/ProjectMeta';
import {
  useProject,
  useDeleteProject,
  useAddProjectObjective,
  useUpdateProjectObjective,
  useDeleteProjectObjective,
} from '@/features/projects/useProjects';

/** Detalhe de um projeto: visão geral, links, objetivos e descrição Markdown. */
export function ProjectDetailPage() {
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
      {/* Cabeçalho */}
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

      {/* Datas */}
      {(p.startDate || p.deadline) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {p.startDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" /> Início em{' '}
              {new Date(p.startDate).toLocaleDateString('pt-BR')}
            </span>
          )}
          {p.deadline && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" /> Prazo:{' '}
              {new Date(p.deadline).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      {/* Tecnologias */}
      {p.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.technologies.map((tech) => (
            <Badge key={tech} variant="default">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {/* Links externos */}
      <ProjectLinks project={p} />

      {/* Visão geral (Markdown) */}
      {p.description.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visão geral</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown content={p.description} />
          </CardContent>
        </Card>
      )}

      <ProjectObjectives project={p} />
    </div>
  );
}

// ─── Links externos ─────────────────────────────────────────────────────────────

function ProjectLinks({ project }: { project: Project }) {
  const links: { icon: LucideIcon; label: string; url: string }[] = [
    { icon: Github, label: 'Repositório', url: project.repoUrl },
    { icon: Figma, label: 'Figma', url: project.figmaUrl },
    { icon: Rocket, label: 'Deploy', url: project.deployUrl },
    { icon: BookText, label: 'Documentação', url: project.docsUrl },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ icon: Icon, label, url }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <Icon className="size-4" /> {label}
        </a>
      ))}
    </div>
  );
}

// ─── Objetivos (checklist reutilizável) ─────────────────────────────────────────

function ProjectObjectives({ project }: { project: Project }) {
  const addObjective = useAddProjectObjective(project.id);
  const updateObjective = useUpdateProjectObjective(project.id);
  const deleteObjective = useDeleteProjectObjective(project.id);

  return (
    <ObjectiveChecklist
      objectives={project.objectives ?? []}
      adding={addObjective.isPending}
      onAdd={(title) => addObjective.mutate({ title })}
      onToggle={(objectiveId, done) =>
        updateObjective.mutate({ objectiveId, input: { done } })
      }
      onDelete={(objectiveId) => deleteObjective.mutate(objectiveId)}
    />
  );
}
