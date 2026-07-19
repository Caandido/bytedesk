import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, X, Plus, Loader2, ArrowRight } from 'lucide-react';
import type { Study } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useProjects } from '@/features/projects/useProjects';
import { useLinkProject, useUnlinkProject } from './useStudies';

/** Projetos vinculados ao estudo — atalhos para abrir e gerir os vínculos. */
export function StudyProjects({ study }: { study: Study }) {
  const link = useLinkProject(study.id);
  const unlink = useUnlinkProject(study.id);
  const projects = useProjects();
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState('');

  const linked = study.projects ?? [];
  const linkedIds = new Set(linked.map((p) => p.id));
  const available = (projects.data ?? []).filter((p) => !linkedIds.has(p.id));

  const doLink = () => {
    if (!selected) return;
    link.mutate(selected, {
      onSuccess: () => {
        setSelected('');
        setPicking(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderKanban className="size-4" /> Projetos{' '}
          {linked.length > 0 && (
            <span className="text-muted-foreground">({linked.length})</span>
          )}
        </CardTitle>
        {!picking && available.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setPicking(true)}>
            <Plus className="size-4" /> Vincular
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {linked.length === 0 && !picking && (
          <p className="text-sm text-muted-foreground">
            Nenhum projeto vinculado. Ligue este estudo aos projetos onde você o
            aplica.
          </p>
        )}

        {picking && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="flex-1"
              aria-label="Selecionar projeto"
            >
              <option value="">Selecione um projeto…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Button size="sm" onClick={doLink} disabled={!selected || link.isPending}>
                {link.isPending && <Loader2 className="size-4 animate-spin" />}
                Vincular
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPicking(false);
                  setSelected('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {linked.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-md border border-border p-3"
          >
            <FolderKanban className="size-4 shrink-0 text-muted-foreground" />
            <Link
              to={`/projetos/${p.id}`}
              className="group flex min-w-0 flex-1 items-center gap-1 text-sm font-medium hover:text-foreground"
            >
              <span className="truncate">{p.name}</span>
              <ArrowRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="Desvincular"
              disabled={unlink.isPending}
              onClick={() => unlink.mutate(p.id)}
            >
              <X className="size-4 text-danger" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
