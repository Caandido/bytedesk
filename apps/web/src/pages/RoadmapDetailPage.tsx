import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Clock,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import type { Roadmap, RoadmapItem } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoadmapItemDialog } from '@/features/roadmaps/RoadmapItemDialog';
import {
  useRoadmap,
  useDeleteRoadmap,
  useAddRoadmapItem,
  useUpdateRoadmapItem,
} from '@/features/roadmaps/useRoadmaps';

/** Detalhe de um roadmap: cabeçalho, progresso e itens da trilha. */
export function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roadmap = useRoadmap(id);
  const deleteRoadmap = useDeleteRoadmap();

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);

  if (roadmap.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (roadmap.isError || !roadmap.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">Roadmap não encontrado.</p>
        <Link to="/roadmaps" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>
    );
  }

  const r = roadmap.data;

  const handleDelete = () => {
    if (window.confirm(`Excluir o roadmap "${r.name}"?`)) {
      deleteRoadmap.mutate(r.id, { onSuccess: () => navigate('/roadmaps') });
    }
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
            <h1 className="text-2xl font-bold tracking-tight">{r.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {r.category && <Badge variant="outline">{r.category}</Badge>}
              {r.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to={`/roadmaps/${r.id}/editar`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Pencil className="size-4" /> Editar
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteRoadmap.isPending}
          >
            <Trash2 className="size-4 text-danger" />
          </Button>
        </div>
      </div>

      {r.description.trim() && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {r.description}
        </p>
      )}

      <RoadmapItems roadmap={r} onEditItem={setEditingItem} />

      <RoadmapItemDialog
        roadmapId={r.id}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}

// ─── Itens ───────────────────────────────────────────────────────────────────

function RoadmapItems({
  roadmap,
  onEditItem,
}: {
  roadmap: Roadmap;
  onEditItem: (item: RoadmapItem) => void;
}) {
  const items = roadmap.items ?? [];
  const done = items.filter((i) => i.done).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  const addItem = useAddRoadmapItem(roadmap.id);
  const updateItem = useUpdateRoadmapItem(roadmap.id);
  const [title, setTitle] = useState('');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addItem.mutate({ title: trimmed }, { onSuccess: () => setTitle('') });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Itens da trilha</CardTitle>
          {items.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {done}/{items.length} · {progress}%
            </span>
          )}
        </div>
        {items.length > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum item ainda. Adicione o primeiro abaixo (ex.: HTML, CSS, JS…).
          </p>
        )}

        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-md border border-border p-3"
            >
              <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
              <input
                type="checkbox"
                checked={item.done}
                onChange={() =>
                  updateItem.mutate({
                    itemId: item.id,
                    input: { done: !item.done },
                  })
                }
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                aria-label={item.title}
              />
              <button
                type="button"
                onClick={() => onEditItem(item)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      item.done && 'text-muted-foreground line-through',
                    )}
                  >
                    {item.title}
                  </span>
                  {item.recommendedTime && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {item.recommendedTime}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </button>
              {item.links.length > 0 && (
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {item.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-info hover:underline"
                    >
                      <ExternalLink className="size-3" /> {link.label}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Novo item (ex.: React)…"
            maxLength={200}
          />
          <Button type="submit" size="icon" disabled={addItem.isPending}>
            {addItem.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
