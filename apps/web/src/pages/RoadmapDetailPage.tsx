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
  Network,
  List,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Roadmap, RoadmapItem } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoadmapItemDialog } from '@/features/roadmaps/RoadmapItemDialog';
import { RoadmapMindmap } from '@/features/roadmaps/RoadmapMindmap';
import {
  useRoadmap,
  useDeleteRoadmap,
  useAddRoadmapItem,
  useUpdateRoadmapItem,
  useReorderRoadmapItems,
} from '@/features/roadmaps/useRoadmaps';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';

/** Detalhe de um roadmap: cabeçalho, progresso e itens da trilha. */
export function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roadmap = useRoadmap(id);
  const deleteRoadmap = useDeleteRoadmap();

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');

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
          <FavoriteButton
            type="ROADMAP"
            entityId={r.id}
            title={r.name}
            subtitle={r.category}
            url={`/roadmaps/${r.id}`}
          />
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

      {/* Alternador Lista / Mapa mental */}
      <div className="inline-flex rounded-md border border-border p-0.5">
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
      </div>

      {view === 'list' ? (
        <RoadmapItems roadmap={r} onEditItem={setEditingItem} />
      ) : (r.items?.length ?? 0) > 0 ? (
        <div className="space-y-2">
          <RoadmapMindmap
            name={r.name}
            items={(r.items ?? [])
              .filter((i) => !i.parentId)
              .sort((a, b) => a.position - b.position)
              .map((i) => ({
                title: i.title,
                done: i.done,
                children: (r.items ?? [])
                  .filter((c) => c.parentId === i.id)
                  .sort((a, b) => a.position - b.position)
                  .map((c) => ({ title: c.title, done: c.done })),
              }))}
          />
          <p className="text-center text-xs text-muted-foreground">
            Espinha = tópicos; ramos pontilhados = sub-itens. Concluídos ficam
            esmaecidos. Edite na visão em lista.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Adicione itens (na visão em lista) para ver o mapa mental.
          </CardContent>
        </Card>
      )}

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
  const reorder = useReorderRoadmapItems(roadmap.id);
  const [title, setTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addItem.mutate({ title: trimmed }, { onSuccess: () => setTitle('') });
  };

  const topItems = items
    .filter((i) => !i.parentId)
    .sort((a, b) => a.position - b.position);
  const childrenOf = (parentId: string) =>
    items
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => a.position - b.position);

  const reorderGroup = (ids: string[], activeId: string, overId: string) => {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    reorder.mutate(arrayMove(ids, oldIndex, newIndex));
  };

  const handleTopDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderGroup(
      topItems.map((i) => i.id),
      active.id as string,
      over.id as string,
    );
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
        {items.length > 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Arraste pela alça para reordenar · clique num item para editar
            descrição, tempo e links.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum item ainda. Adicione o primeiro abaixo (ex.: HTML, CSS, JS…).
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTopDragEnd}
        >
          <SortableContext
            items={topItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {topItems.map((item) => (
                <SortableRoadmapItem
                  key={item.id}
                  roadmapId={roadmap.id}
                  item={item}
                  onEditItem={onEditItem}
                  sensors={sensors}
                  childItems={childrenOf(item.id)}
                  onReorderGroup={reorderGroup}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

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

/** Conteúdo visual de um item (compartilhado por tópicos e sub-itens). */
function ItemRow({
  item,
  onEditItem,
  onToggle,
  handleProps,
  nested = false,
}: {
  item: RoadmapItem;
  onEditItem: (item: RoadmapItem) => void;
  onToggle: () => void;
  handleProps: Record<string, unknown>;
  nested?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-border bg-card p-3',
        nested && 'bg-muted/30 p-2',
      )}
    >
      <span
        {...handleProps}
        role="button"
        aria-label="Arrastar para reordenar"
        className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className={nested ? 'size-3.5' : 'size-4'} />
      </span>
      <input
        type="checkbox"
        checked={item.done}
        onChange={onToggle}
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
              nested ? 'text-sm' : 'text-sm font-medium',
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
    </div>
  );
}

/** Tópico raiz arrastável, com bloco de sub-itens (aninhamento de 1 nível). */
function SortableRoadmapItem({
  roadmapId,
  item,
  onEditItem,
  sensors,
  childItems,
  onReorderGroup,
}: {
  roadmapId: string;
  item: RoadmapItem;
  onEditItem: (item: RoadmapItem) => void;
  sensors: ReturnType<typeof useSensors>;
  childItems: RoadmapItem[];
  onReorderGroup: (ids: string[], activeId: string, overId: string) => void;
}) {
  const updateItem = useUpdateRoadmapItem(roadmapId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Translate.toString(transform), transition };

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderGroup(
      childItems.map((c) => c.id),
      active.id as string,
      over.id as string,
    );
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'relative z-10 opacity-80')}
    >
      <ItemRow
        item={item}
        onEditItem={onEditItem}
        onToggle={() =>
          updateItem.mutate({ itemId: item.id, input: { done: !item.done } })
        }
        handleProps={{ ...attributes, ...listeners }}
      />
      <div className="ml-6 mt-1.5 space-y-1.5 border-l-2 border-border/60 pl-3">
        {childItems.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChildDragEnd}
          >
            <SortableContext
              items={childItems.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1.5">
                {childItems.map((child) => (
                  <SortableSubItem
                    key={child.id}
                    roadmapId={roadmapId}
                    item={child}
                    onEditItem={onEditItem}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <AddSubItem roadmapId={roadmapId} parentId={item.id} />
      </div>
    </li>
  );
}

/** Sub-item arrastável (dentro de um tópico raiz). */
function SortableSubItem({
  roadmapId,
  item,
  onEditItem,
}: {
  roadmapId: string;
  item: RoadmapItem;
  onEditItem: (item: RoadmapItem) => void;
}) {
  const updateItem = useUpdateRoadmapItem(roadmapId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'relative z-10 opacity-80')}
    >
      <ItemRow
        nested
        item={item}
        onEditItem={onEditItem}
        onToggle={() =>
          updateItem.mutate({ itemId: item.id, input: { done: !item.done } })
        }
        handleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
}

/** Botão/campo inline para adicionar um sub-item a um tópico raiz. */
function AddSubItem({
  roadmapId,
  parentId,
}: {
  roadmapId: string;
  parentId: string;
}) {
  const addItem = useAddRoadmapItem(roadmapId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addItem.mutate({ title: trimmed, parentId }, { onSuccess: () => setTitle('') });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="size-3" /> Sub-item
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title && setOpen(false)}
        placeholder="Sub-item…"
        maxLength={200}
        autoFocus
        className="h-8"
      />
      <Button type="submit" size="sm" disabled={addItem.isPending}>
        {addItem.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
      </Button>
    </form>
  );
}
