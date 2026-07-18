import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Loader2, Map, ListChecks } from 'lucide-react';
import type { Roadmap } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useRoadmaps,
  useDeleteRoadmap,
  useRoadmapTemplates,
} from '@/features/roadmaps/useRoadmaps';

type SortKey = 'recent' | 'name' | 'progress';

/** Lista de roadmaps com busca, filtro por categoria e ordenação. */
export function RoadmapsPage() {
  const roadmaps = useRoadmaps();
  const deleteRoadmap = useDeleteRoadmap();
  const templates = useRoadmapTemplates();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState<SortKey>('recent');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of roadmaps.data ?? []) if (r.category) set.add(r.category);
    return [...set].sort();
  }, [roadmaps.data]);

  const progressOf = (r: Roadmap) => {
    const items = r.items ?? [];
    if (items.length === 0) return 0;
    return items.filter((i) => i.done).length / items.length;
  };

  const visible = useMemo(() => {
    const data = roadmaps.data ?? [];
    const term = search.trim().toLowerCase();
    const filtered = data.filter((r) => {
      if (category !== 'ALL' && r.category !== category) return false;
      if (!term) return true;
      return [r.name, r.category, ...r.tags]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return progressOf(b) - progressOf(a);
        case 'recent':
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [roadmaps.data, search, category, sort]);

  const handleDelete = (e: React.MouseEvent, roadmap: Roadmap) => {
    e.preventDefault();
    if (window.confirm(`Excluir o roadmap "${roadmap.name}"?`)) {
      deleteRoadmap.mutate(roadmap.id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmaps</h1>
          <p className="text-muted-foreground">
            Trilhas de aprendizado com itens, recursos e progresso.
          </p>
        </div>
        <Link to="/roadmaps/novo" className={cn(buttonVariants(), 'shrink-0')}>
          <Plus className="size-4" /> Novo roadmap
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, categoria ou tag…"
            className="pl-9"
            aria-label="Buscar roadmaps"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="ALL">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
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
            <option value="progress">Progresso</option>
          </Select>
        </div>
      </div>

      {roadmaps.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando roadmaps…
        </p>
      )}
      {roadmaps.isError && (
        <p className="text-sm text-danger">Erro ao carregar os roadmaps.</p>
      )}

      {roadmaps.isSuccess && roadmaps.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Map className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Você ainda não tem roadmaps. Crie a primeira trilha.
            </p>
            <Link to="/roadmaps/novo" className={buttonVariants()}>
              <Plus className="size-4" /> Novo roadmap
            </Link>
          </CardContent>
        </Card>
      )}

      {roadmaps.isSuccess &&
        roadmaps.data.length > 0 &&
        visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum roadmap corresponde aos filtros.
          </p>
        )}

      {visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              progress={progressOf(roadmap)}
              onDelete={handleDelete}
              deleting={deleteRoadmap.isPending}
            />
          ))}
        </div>
      )}

      {/* Guias prontos (roadmap.sh) */}
      <div className="space-y-3 pt-4">
        <div>
          <h2 className="text-lg font-semibold">Guias prontos</h2>
          <p className="text-sm text-muted-foreground">
            Trilhas completas inspiradas no{' '}
            <a
              href="https://roadmap.sh"
              target="_blank"
              rel="noreferrer"
              className="text-info hover:underline"
            >
              roadmap.sh
            </a>{' '}
            (© Kamran Ahmed e colaboradores) — abra para ver os tópicos com
            descrição e links oficiais, ou importe para acompanhar seu progresso.
            Cada guia traz o link direto para o roadmap original.
          </p>
        </div>
        {templates.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando guias…
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(templates.data ?? []).map((template) => (
            <Link
              key={template.id}
              to={`/roadmaps/guia/${template.id}`}
              className="group block"
            >
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <Map className="size-4 shrink-0 text-primary" />
                    <h3 className="font-semibold leading-tight">
                      {template.name}
                    </h3>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-1">
                    <Badge variant="outline">{template.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ListChecks className="size-3.5" /> {template.itemCount}{' '}
                      tópicos
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapCard({
  roadmap,
  progress,
  onDelete,
  deleting,
}: {
  roadmap: Roadmap;
  progress: number;
  onDelete: (e: React.MouseEvent, roadmap: Roadmap) => void;
  deleting: boolean;
}) {
  const items = roadmap.items ?? [];
  const done = items.filter((i) => i.done).length;

  return (
    <Link to={`/roadmaps/${roadmap.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold leading-tight">
                {roadmap.name}
              </h3>
              {roadmap.category && (
                <p className="truncate text-xs text-muted-foreground">
                  {roadmap.category}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 -mt-2 size-8 shrink-0"
              aria-label={`Excluir ${roadmap.name}`}
              onClick={(e) => onDelete(e, roadmap)}
              disabled={deleting}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>

          {roadmap.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {roadmap.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ListChecks className="size-3.5" />
                {done}/{items.length} itens
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
