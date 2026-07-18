import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Star,
  BookOpen,
  Pencil,
  Trash2,
  Loader2,
  Eye,
} from 'lucide-react';
import type { WikiPage } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import {
  useWikiPages,
  useCreateWikiPage,
  useUpdateWikiPage,
  useDeleteWikiPage,
} from '@/features/wiki/useWiki';

/** Wiki pessoal: lista (busca/categoria/favoritos) + editor Markdown das páginas. */
export function ConhecimentoPage() {
  const pages = useWikiPages();
  const createPage = useCreateWikiPage();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const list = useMemo(() => pages.data ?? [], [pages.data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of list) if (p.category) set.add(p.category);
    return [...set].sort();
  }, [list]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((p) => {
      if (favoritesOnly && !p.favorite) return false;
      if (category !== 'ALL' && p.category !== category) return false;
      if (!term) return true;
      return [p.title, p.category, ...p.tags]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [list, search, category, favoritesOnly]);

  const selected = list.find((p) => p.id === selectedId) ?? null;

  // Mantém uma página selecionada válida quando a lista filtrada muda.
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const handleCreate = () => {
    createPage.mutate(
      { title: 'Nova página' },
      {
        onSuccess: (page) => {
          setSelectedId(page.id);
          setEditing(true);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conhecimento</h1>
        <p className="text-muted-foreground">
          Sua wiki pessoal de programação, em Markdown.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        {/* Lista */}
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={createPage.isPending}
          >
            <Plus className="size-4" /> Nova página
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="pl-9"
              aria-label="Buscar páginas"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filtrar por categoria"
              className="flex-1"
            >
              <option value="ALL">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button
              variant={favoritesOnly ? 'primary' : 'outline'}
              size="icon"
              aria-label="Só favoritos"
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              <Star
                className={cn('size-4', favoritesOnly && 'fill-current')}
              />
            </Button>
          </div>

          {pages.isLoading && (
            <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Carregando…
            </p>
          )}
          {pages.isError && (
            <p className="px-1 text-sm text-danger">Erro ao carregar.</p>
          )}

          {pages.isSuccess && filtered.length === 0 && (
            <p className="px-1 py-4 text-sm text-muted-foreground">
              {list.length === 0
                ? 'Nenhuma página ainda.'
                : 'Nada corresponde aos filtros.'}
            </p>
          )}

          <nav className="space-y-1">
            {filtered.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  setSelectedId(page.id);
                  setEditing(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  page.id === selectedId
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                {page.favorite ? (
                  <Star className="size-3.5 shrink-0 fill-warning text-warning" />
                ) : (
                  <BookOpen className="size-3.5 shrink-0" />
                )}
                <span className="flex-1 truncate">{page.title}</span>
                {page.category && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {page.category}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Editor */}
        {selected ? (
          <WikiEditor
            key={selected.id}
            page={selected}
            editing={editing}
            onEditingChange={setEditing}
            onDeleted={() => {
              setEditing(false);
              setSelectedId(null);
            }}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <BookOpen className="size-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                Selecione uma página ou crie uma nova.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Editor de uma página ────────────────────────────────────────────────────

function WikiEditor({
  page,
  editing,
  onEditingChange,
  onDeleted,
}: {
  page: WikiPage;
  editing: boolean;
  onEditingChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const updatePage = useUpdateWikiPage();
  const deletePage = useDeleteWikiPage();

  const [title, setTitle] = useState(page.title);
  const [category, setCategory] = useState(page.category);
  const [tags, setTags] = useState(page.tags.join(', '));
  const [content, setContent] = useState(page.content);

  useEffect(() => {
    if (editing) {
      setTitle(page.title);
      setCategory(page.category);
      setTags(page.tags.join(', '));
      setContent(page.content);
    }
  }, [editing, page]);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updatePage.mutate(
      {
        id: page.id,
        input: {
          title: trimmed,
          category: category.trim(),
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
      },
      { onSuccess: () => onEditingChange(false) },
    );
  };

  const toggleFavorite = () =>
    updatePage.mutate({ id: page.id, input: { favorite: !page.favorite } });

  const handleDelete = () => {
    if (window.confirm(`Excluir a página "${page.title}"?`)) {
      deletePage.mutate(page.id, { onSuccess: onDeleted });
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          {editing ? (
            <div className="flex-1 space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                maxLength={200}
                className="text-base font-semibold"
              />
              <div className="flex gap-2">
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Categoria (ex.: React)"
                  className="flex-1"
                />
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tags, separadas, por, vírgula"
                  className="flex-1"
                />
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {page.category && (
                  <Badge variant="outline">{page.category}</Badge>
                )}
                {page.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex shrink-0 gap-2">
            {!editing && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  page.favorite ? 'Remover dos favoritos' : 'Favoritar'
                }
                onClick={toggleFavorite}
                disabled={updatePage.isPending}
              >
                <Star
                  className={cn(
                    'size-4',
                    page.favorite && 'fill-warning text-warning',
                  )}
                />
              </Button>
            )}
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditingChange(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={save} disabled={updatePage.isPending}>
                  {updatePage.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditingChange(true)}
                >
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deletePage.isPending}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva em Markdown…"
              rows={16}
              className="font-mono text-xs"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> Markdown (GFM): títulos, listas,
              tabelas, código, links e imagens.
            </p>
          </div>
        ) : page.content.trim() ? (
          <Markdown content={page.content} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Página vazia. Clique em “Editar” para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
