import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  GraduationCap,
  Clock,
  ListChecks,
} from 'lucide-react';
import {
  STUDY_STATUS_LABELS,
  STUDY_LEVEL_LABELS,
  type Study,
  type StudyStatus,
  type StudyLevel,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StudyStatusBadge, StudyLevelBadge } from '@/features/studies/StudyMeta';
import { useStudies, useDeleteStudy } from '@/features/studies/useStudies';

type StatusFilter = StudyStatus | 'ALL';
type LevelFilter = StudyLevel | 'ALL';
type SortKey = 'recent' | 'name' | 'hours';

/**
 * Lista de estudos com busca (nome/tecnologia/tags), filtros (status, nível) e
 * ordenação — tudo no client sobre os dados carregados. Atende a exigência da spec:
 * "Toda informação importante deve possuir pesquisa, filtros e ordenação".
 */
export function StudiesPage() {
  const studies = useStudies();
  const deleteStudy = useDeleteStudy();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [level, setLevel] = useState<LevelFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('recent');

  const visible = useMemo(() => {
    const data = studies.data ?? [];
    const term = search.trim().toLowerCase();

    const filtered = data.filter((s) => {
      if (status !== 'ALL' && s.status !== status) return false;
      if (level !== 'ALL' && s.level !== level) return false;
      if (!term) return true;
      const haystack = [s.name, s.technology, s.category, ...s.tags]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hours':
          return b.hoursStudied - a.hoursStudied;
        case 'recent':
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [studies.data, search, status, level, sort]);

  const handleDelete = (e: React.MouseEvent, study: Study) => {
    e.preventDefault();
    if (window.confirm(`Excluir o estudo "${study.name}"?`)) {
      deleteStudy.mutate(study.id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudos</h1>
          <p className="text-muted-foreground">
            Organize seus estudos com objetivos, checklist e anotações.
          </p>
        </div>
        <Link to="/estudos/novo" className={cn(buttonVariants(), 'shrink-0')}>
          <Plus className="size-4" /> Novo estudo
        </Link>
      </div>

      {/* Barra de busca / filtros / ordenação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, tecnologia ou tag…"
            className="pl-9"
            aria-label="Buscar estudos"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:w-auto">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por status"
          >
            <option value="ALL">Todos os status</option>
            {Object.entries(STUDY_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelFilter)}
            aria-label="Filtrar por nível"
          >
            <option value="ALL">Todos os níveis</option>
            {Object.entries(STUDY_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
            <option value="hours">Mais horas</option>
          </Select>
        </div>
      </div>

      {/* Estados */}
      {studies.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando estudos…
        </p>
      )}
      {studies.isError && (
        <p className="text-sm text-danger">Erro ao carregar os estudos.</p>
      )}

      {studies.isSuccess && studies.data.length === 0 && (
        <EmptyState />
      )}

      {studies.isSuccess &&
        studies.data.length > 0 &&
        visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum estudo corresponde aos filtros.
          </p>
        )}

      {visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              onDelete={handleDelete}
              deleting={deleteStudy.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudyCard({
  study,
  onDelete,
  deleting,
}: {
  study: Study;
  onDelete: (e: React.MouseEvent, study: Study) => void;
  deleting: boolean;
}) {
  const objectives = study.objectives ?? [];
  const done = objectives.filter((o) => o.done).length;

  return (
    <Link to={`/estudos/${study.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{study.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 -mt-2 size-8 shrink-0"
              aria-label={`Excluir ${study.name}`}
              onClick={(e) => onDelete(e, study)}
              disabled={deleting}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <StudyStatusBadge status={study.status} />
            <StudyLevelBadge level={study.level} />
          </div>

          {study.technology && (
            <p className="text-sm text-muted-foreground">{study.technology}</p>
          )}

          {study.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {study.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            {objectives.length > 0 && (
              <span className="flex items-center gap-1">
                <ListChecks className="size-3.5" />
                {done}/{objectives.length}
              </span>
            )}
            {study.hoursStudied > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {study.hoursStudied}h
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <GraduationCap className="size-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          Você ainda não tem estudos. Crie o primeiro para começar.
        </p>
        <Link to="/estudos/novo" className={buttonVariants()}>
          <Plus className="size-4" /> Novo estudo
        </Link>
      </CardContent>
    </Card>
  );
}
