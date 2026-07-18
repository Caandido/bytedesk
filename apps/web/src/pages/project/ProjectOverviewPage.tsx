import { useOutletContext } from 'react-router-dom';
import {
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
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import { ObjectiveChecklist } from '@/components/ObjectiveChecklist';
import {
  useAddProjectObjective,
  useUpdateProjectObjective,
  useDeleteProjectObjective,
} from '@/features/projects/useProjects';
import type { ProjectOutletContext } from './ProjectLayout';

/** Aba "Visão geral": datas, tecnologias, links, descrição Markdown e objetivos. */
export function ProjectOverviewPage() {
  const { project: p } = useOutletContext<ProjectOutletContext>();

  return (
    <div className="space-y-6">
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

      {p.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.technologies.map((tech) => (
            <Badge key={tech} variant="default">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      <ProjectLinks project={p} />

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
