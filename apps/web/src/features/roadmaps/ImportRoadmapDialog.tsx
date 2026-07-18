import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Download, Search, Eye, ListChecks } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRoadmapTemplates, useImportRoadmap } from './useRoadmaps';

interface ImportRoadmapDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal para importar um roadmap pronto (catálogo curado, inspirado no roadmap.sh).
 * Os guias não aparecem soltos na tela — só aqui, com busca, para importar ou
 * pré-visualizar. Ao importar, cria um roadmap editável do usuário e navega a ele.
 */
export function ImportRoadmapDialog({ open, onClose }: ImportRoadmapDialogProps) {
  const templates = useRoadmapTemplates();
  const importRoadmap = useImportRoadmap();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [importingId, setImportingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = templates.data ?? [];
    if (!term) return data;
    return data.filter((t) =>
      `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(term),
    );
  }, [templates.data, search]);

  const handleImport = (id: string) => {
    setImportingId(id);
    importRoadmap.mutate(id, {
      onSuccess: (roadmap) => {
        onClose();
        navigate(`/roadmaps/${roadmap.id}`);
      },
      onSettled: () => setImportingId(null),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Importar roadmap pronto"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Trilhas curadas, inspiradas no{' '}
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noreferrer"
            className="text-info hover:underline"
          >
            roadmap.sh
          </a>
          . Importe para virar um roadmap seu — editável, com mapa mental e progresso.
        </p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar (ex.: frontend, react, docker…)"
            className="pl-9"
            aria-label="Buscar roadmaps prontos"
            autoFocus
          />
        </div>

        {templates.isLoading && (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando catálogo…
          </p>
        )}

        {templates.isSuccess && visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum roadmap corresponde à busca.
          </p>
        )}

        <ul className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
          {visible.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-md border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{t.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {t.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline">{t.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5" /> {t.itemCount} tópicos
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <a
                  href={`/roadmaps/guia/${t.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    navigate(`/roadmaps/guia/${t.id}`);
                  }}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                  )}
                  title="Pré-visualizar"
                >
                  <Eye className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => handleImport(t.id)}
                  disabled={importRoadmap.isPending}
                  className={cn(buttonVariants({ size: 'sm' }))}
                >
                  {importingId === t.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Importar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
