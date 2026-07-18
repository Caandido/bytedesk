import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Loader2,
  CircleDot,
  Play,
  Network,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoadmapMindmap } from '@/features/roadmaps/RoadmapMindmap';
import {
  useRoadmapTemplate,
  useImportRoadmap,
} from '@/features/roadmaps/useRoadmaps';

/**
 * Guia (somente leitura) de um roadmap do catálogo — todos os tópicos com
 * descrição e links. Pode ser importado para virar uma trilha com checklist.
 */
export function RoadmapGuidePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const template = useRoadmapTemplate(id);
  const importRoadmap = useImportRoadmap();
  const [view, setView] = useState<'map' | 'list'>('map');

  if (template.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando guia…
      </p>
    );
  }
  if (template.isError || !template.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">Guia não encontrado.</p>
        <Link to="/roadmaps" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>
    );
  }

  const t = template.data;

  const handleImport = () => {
    importRoadmap.mutate(t.id, {
      onSuccess: (roadmap) => navigate(`/roadmaps/${roadmap.id}`),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            to="/roadmaps"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.name}</h1>
            <p className="text-muted-foreground">{t.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {t.items.length} tópicos
              </span>
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-info hover:underline"
              >
                <ExternalLink className="size-3" /> roadmap.sh
              </a>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row">
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <ExternalLink className="size-4" /> Ver no roadmap.sh
          </a>
          <Button onClick={handleImport} disabled={importRoadmap.isPending}>
            {importRoadmap.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Importar para acompanhar
          </Button>
        </div>
      </div>

      {/* Alternador Mapa mental / Lista */}
      <div className="inline-flex rounded-md border border-border p-0.5">
        <button
          type="button"
          onClick={() => setView('map')}
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors',
            view === 'map'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Network className="size-4" /> Mapa mental
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors',
            view === 'list'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="size-4" /> Lista
        </button>
      </div>

      {view === 'map' && (
        <div className="space-y-2">
          <RoadmapMindmap template={t} />
          <p className="text-center text-xs text-muted-foreground">
            Nós em destaque (branco) têm roadmap dedicado — clique para navegar.
          </p>
        </div>
      )}

      {view === 'list' && (
      <ol className="space-y-2">
        {t.items.map((item, i) => (
          <li key={i}>
            <Card>
              <CardContent className="flex gap-3 p-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <p className="flex items-center gap-2 font-medium leading-snug">
                    <CircleDot className="size-4 shrink-0 text-primary" />
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.links && item.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {item.links.map((link, li) => {
                        const isVideo = link.url.includes('youtube.com');
                        return (
                          <a
                            key={li}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:underline',
                              isVideo
                                ? 'bg-danger/10 text-danger'
                                : 'bg-muted text-info',
                            )}
                          >
                            {isVideo ? (
                              <Play className="size-3" />
                            ) : (
                              <ExternalLink className="size-3" />
                            )}
                            {link.label.replace('🎥 ', '')}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
      )}

      {/* Créditos — o roadmap oficial é do roadmap.sh (licença de uso pessoal). */}
      <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        Inspirado nos roadmaps de{' '}
        <a
          href={t.url}
          target="_blank"
          rel="noreferrer"
          className="text-info hover:underline"
        >
          roadmap.sh
        </a>{' '}
        · © Kamran Ahmed e colaboradores. Esta é uma trilha independente com links
        para documentação oficial; o conteúdo original está em roadmap.sh.
      </p>
    </div>
  );
}
