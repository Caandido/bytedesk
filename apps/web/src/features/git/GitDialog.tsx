import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import {
  updateProjectSchema,
  type Project,
  type UpdateProjectInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProject } from '@/features/projects/useProjects';

interface GitDialogProps {
  project: Project | null;
  onClose: () => void;
}

/** Modal para editar os campos Git de um projeto (repositório, branch, tags…). */
export function GitDialog({ project, onClose }: GitDialogProps) {
  const updateProject = useUpdateProject(project?.id ?? '');

  const [repoUrl, setRepoUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('');
  const [lastCommit, setLastCommit] = useState('');
  const [nextVersion, setNextVersion] = useState('');
  const [gitTags, setGitTags] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setRepoUrl(project.repoUrl);
      setGitBranch(project.gitBranch);
      setLastCommit(project.lastCommit);
      setNextVersion(project.nextVersion);
      setGitTags(project.gitTags.join(', '));
      setError(null);
    }
  }, [project]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const input: UpdateProjectInput = {
      repoUrl: repoUrl.trim(),
      gitBranch,
      lastCommit,
      nextVersion,
      gitTags: gitTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    updateProject.mutate(parsed.data, {
      onSuccess: onClose,
      onError: (err) =>
        setError(err instanceof Error ? err.message : 'Erro ao salvar.'),
    });
  };

  return (
    <Dialog
      open={Boolean(project)}
      onClose={onClose}
      title={project ? `Git · ${project.name}` : 'Git'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>Repositório</Label>
          <Input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/usuario/repo"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Input
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder="main"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Próxima versão</Label>
            <Input
              value={nextVersion}
              onChange={(e) => setNextVersion(e.target.value)}
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Último commit</Label>
          <Input
            value={lastCommit}
            onChange={(e) => setLastCommit(e.target.value)}
            placeholder="feat: dashboard real"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tags</Label>
          <Input
            value={gitTags}
            onChange={(e) => setGitTags(e.target.value)}
            placeholder="v0.9.0, v0.10.0"
          />
          <p className="text-xs text-muted-foreground">Separe por vírgula.</p>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={updateProject.isPending}>
            {updateProject.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
