import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  GitCommit,
  Github,
  Tag,
  Pencil,
  Loader2,
  ArrowUpRight,
  FolderKanban,
} from 'lucide-react';
import type { Project } from '@devflow/shared';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitDialog } from '@/features/git/GitDialog';
import { useProjects } from '@/features/projects/useProjects';

/**
 * Visão de Git de todos os projetos (sem integração — campos manuais). Lista cada
 * projeto com repositório, branch, último commit, próxima versão e tags.
 */
export function GitPage() {
  const projects = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Git</h1>
        <p className="text-muted-foreground">
          Repositório, branch, commits, versões e tags dos seus projetos.
        </p>
      </div>

      {projects.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      )}
      {projects.isError && (
        <p className="text-sm text-danger">Erro ao carregar os projetos.</p>
      )}

      {projects.isSuccess && projects.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderKanban className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhum projeto ainda. Crie um projeto para registrar dados de Git.
            </p>
            <Link to="/projetos/novo" className={buttonVariants()}>
              Novo projeto
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {(projects.data ?? []).map((project) => (
          <GitCard key={project.id} project={project} onEdit={setEditing} />
        ))}
      </div>

      <GitDialog project={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function GitCard({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: (p: Project) => void;
}) {
  const hasGit =
    project.repoUrl ||
    project.gitBranch ||
    project.lastCommit ||
    project.nextVersion ||
    project.gitTags.length > 0;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/projetos/${project.id}`}
            className="font-semibold hover:text-primary"
          >
            {project.name}
          </Link>
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            <Pencil className="size-4" /> Editar
          </Button>
        </div>

        {!hasGit ? (
          <p className="text-sm text-muted-foreground">
            Sem dados de Git. Clique em “Editar” para adicionar.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-info hover:underline"
              >
                <Github className="size-4" /> Repositório
                <ArrowUpRight className="size-3" />
              </a>
            )}
            {project.gitBranch && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <GitBranch className="size-4" /> {project.gitBranch}
              </span>
            )}
            {project.nextVersion && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Tag className="size-4" /> próx.: v{project.nextVersion}
              </span>
            )}
          </div>
        )}

        {project.lastCommit && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitCommit className="size-3.5" /> {project.lastCommit}
          </p>
        )}

        {project.gitTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.gitTags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Tag className="size-3" /> {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
