import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Plus,
  GraduationCap,
  FolderKanban,
  ListChecks,
  Bug as BugIcon,
  Map as MapIcon,
  BookOpen,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import {
  SEARCH_TYPE_LABELS,
  type SearchResult,
  type SearchResultType,
} from '@devflow/shared';
import { navItems } from '@/app/navigation';
import { useUIStore } from '@/stores/ui';
import { useSearch } from '@/features/search/useSearch';

/** Ações rápidas (criação) exibidas quando não há busca ativa. */
const quickActions = [
  { label: 'Novo estudo', path: '/estudos/novo', icon: Plus },
  { label: 'Novo projeto', path: '/projetos/novo', icon: Plus },
  { label: 'Novo roadmap', path: '/roadmaps/novo', icon: Plus },
  { label: 'Nova página (Conhecimento)', path: '/conhecimento', icon: Plus },
  { label: 'Novo registro no diário', path: '/diario', icon: Plus },
];

const RESULT_ICON: Record<SearchResultType, LucideIcon> = {
  study: GraduationCap,
  project: FolderKanban,
  task: ListChecks,
  bug: BugIcon,
  roadmap: MapIcon,
  wiki: BookOpen,
  error: BugIcon,
};

const RESULT_ORDER: SearchResultType[] = [
  'study',
  'project',
  'task',
  'bug',
  'roadmap',
  'wiki',
  'error',
];

function routeFor(r: SearchResult): string {
  switch (r.type) {
    case 'study':
      return `/estudos/${r.id}`;
    case 'project':
      return `/projetos/${r.id}`;
    case 'task':
      return `/projetos/${r.projectId}/tarefas`;
    case 'bug':
      return `/projetos/${r.projectId}/bugs`;
    case 'roadmap':
      return `/roadmaps/${r.id}`;
    case 'wiki':
      return '/conhecimento';
    case 'error':
      return '/erros';
  }
}

/**
 * Pesquisa Global (Ctrl+K). Sem termo, mostra ações rápidas e navegação por módulos;
 * com 2+ caracteres, busca no servidor em estudos, projetos, tarefas e bugs.
 */
export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const search = useSearch(query);

  // Atalho global Ctrl+K / Cmd+K.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!useUIStore.getState().commandOpen);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  // Limpa o termo ao abrir/fechar.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  // Agrupa os resultados por tipo, preservando a ordem de exibição.
  const grouped = useMemo(() => {
    const results = search.data ?? [];
    return RESULT_ORDER.map((type) => ({
      type,
      items: results.filter((r) => r.type === type),
    })).filter((g) => g.items.length > 0);
  }, [search.data]);

  const searching = search.enabled;
  const hasResults = grouped.length > 0;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Pesquisa global"
      shouldFilter={false}
      className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl data-[state=open]:animate-in"
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar estudos, projetos, tarefas, bugs…"
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {searching && search.isFetching && (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>

      <Command.List className="max-h-80 overflow-y-auto p-2">
        {/* Modo busca (2+ caracteres) */}
        {searching ? (
          <>
            {!hasResults && !search.isFetching && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado para “{search.term}”.
              </div>
            )}
            {grouped.map((group) => (
              <Command.Group
                key={group.type}
                heading={SEARCH_TYPE_LABELS[group.type]}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {group.items.map((r) => {
                  const Icon = RESULT_ICON[r.type];
                  return (
                    <Command.Item
                      key={`${r.type}-${r.id}`}
                      value={`${r.type}-${r.id}`}
                      onSelect={() => go(routeFor(r))}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{r.title}</span>
                      <span className="shrink-0 truncate text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </>
        ) : (
          /* Modo padrão (sem termo): ações + módulos */
          <>
            <Command.Group
              heading="Ações"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {quickActions.map(({ label, path, icon: Icon }) => (
                <Command.Item
                  key={path}
                  value={label}
                  onSelect={() => go(path)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group
              heading="Módulos"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {navItems.map(({ label, path, icon: Icon }) => (
                <Command.Item
                  key={path}
                  value={label}
                  onSelect={() => go(path)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
