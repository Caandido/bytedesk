import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Tag,
  Trash2,
  Loader2,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import {
  generateChangelog,
  type ProjectVersion,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import { VersionDialog } from '@/features/versions/VersionDialog';
import { useVersions, useDeleteVersion } from '@/features/versions/useVersions';
import type { ProjectOutletContext } from './ProjectLayout';

type View = 'list' | 'changelog';

/** Aba "Versões": histórico de versões + changelog gerado automaticamente. */
export function ProjectVersionsPage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const versions = useVersions(projectId);
  const deleteVersion = useDeleteVersion(projectId);

  const [view, setView] = useState<View>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectVersion | null>(null);

  const list = useMemo(() => versions.data ?? [], [versions.data]);
  const changelog = useMemo(() => generateChangelog(list), [list]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (v: ProjectVersion) => {
    setEditing(v);
    setDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, v: ProjectVersion) => {
    e.stopPropagation();
    if (window.confirm(`Excluir a versão ${v.version}?`)) {
      deleteVersion.mutate(v.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-border p-0.5">
          <TabButton active={view === 'list'} onClick={() => setView('list')}>
            Versões
          </TabButton>
          <TabButton
            active={view === 'changelog'}
            onClick={() => setView('changelog')}
          >
            Changelog
          </TabButton>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" /> Nova versão
        </Button>
      </div>

      {versions.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando versões…
        </p>
      )}
      {versions.isError && (
        <p className="text-sm text-danger">Erro ao carregar as versões.</p>
      )}

      {versions.isSuccess && list.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Tag className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhuma versão registrada. Crie a primeira para gerar o changelog.
            </p>
            <Button onClick={openNew}>
              <Plus className="size-4" /> Nova versão
            </Button>
          </CardContent>
        </Card>
      )}

      {list.length > 0 && view === 'list' && (
        <div className="space-y-2">
          {list.map((v) => (
            <VersionCard
              key={v.id}
              version={v}
              onClick={() => openEdit(v)}
              onDelete={(e) => handleDelete(e, v)}
              deleting={deleteVersion.isPending}
            />
          ))}
        </div>
      )}

      {list.length > 0 && view === 'changelog' && (
        <ChangelogView changelog={changelog} />
      )}

      <VersionDialog
        projectId={projectId}
        open={dialogOpen}
        version={editing}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function VersionCard({
  version: v,
  onClick,
  onDelete,
  deleting,
}: {
  version: ProjectVersion;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  deleting: boolean;
}) {
  const counts = [
    ['Novidades', v.features],
    ['Correções', v.fixes],
    ['Melhorias', v.improvements],
    ['Breaking', v.breaking],
  ]
    .map(([label, text]) => {
      const n = text.split('\n').filter((l) => l.trim()).length;
      return n > 0 ? `${n} ${label.toLowerCase()}` : null;
    })
    .filter(Boolean);

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary">v{v.version}</Badge>
            {v.releasedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {new Date(v.releasedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          {v.description.trim() && (
            <p className="text-sm text-muted-foreground">{v.description}</p>
          )}
          {counts.length > 0 && (
            <p className="text-xs text-muted-foreground">{counts.join(' · ')}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          aria-label={`Excluir versão ${v.version}`}
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="size-4 text-danger" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ChangelogView({ changelog }: { changelog: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(changelog);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard indisponível — silencioso.
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            CHANGELOG.md
          </h3>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? (
              <>
                <Check className="size-4 text-primary" /> Copiado
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copiar
              </>
            )}
          </Button>
        </div>
        <Markdown content={changelog} />
      </CardContent>
    </Card>
  );
}
