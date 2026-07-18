import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  createRoadmapItemSchema,
  type RoadmapItem,
  type Link as ItemLink,
  type UpdateRoadmapItemInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateRoadmapItem, useDeleteRoadmapItem } from './useRoadmaps';

interface RoadmapItemDialogProps {
  roadmapId: string;
  item: RoadmapItem | null;
  onClose: () => void;
}

/** Modal de edição de um item da trilha (descrição, tempo recomendado, links). */
export function RoadmapItemDialog({
  roadmapId,
  item,
  onClose,
}: RoadmapItemDialogProps) {
  const updateItem = useUpdateRoadmapItem(roadmapId);
  const deleteItem = useDeleteRoadmapItem(roadmapId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendedTime, setRecommendedTime] = useState('');
  const [links, setLinks] = useState<ItemLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setRecommendedTime(item.recommendedTime);
      setLinks(item.links);
      setError(null);
    }
  }, [item]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const input: UpdateRoadmapItemInput = {
      title,
      description,
      recommendedTime,
      links: links.filter((l) => l.label.trim() && l.url.trim()),
    };

    const parsed = createRoadmapItemSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    updateItem.mutate(
      { itemId: item.id, input: parsed.data },
      { onSuccess: onClose },
    );
  };

  const handleDelete = () => {
    if (!item) return;
    if (window.confirm(`Excluir o item "${item.title}"?`)) {
      deleteItem.mutate(item.id, { onSuccess: onClose });
    }
  };

  const updateLink = (i: number, patch: Partial<ItemLink>) =>
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <Dialog open={Boolean(item)} onClose={onClose} title="Editar item">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tempo recomendado</Label>
          <Input
            value={recommendedTime}
            onChange={(e) => setRecommendedTime(e.target.value)}
            placeholder="Ex.: 2 semanas"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Descrição / notas</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Recursos (links)</Label>
          {links.map((link, i) => (
            <div key={i} className="flex items-start gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                placeholder="Rótulo"
                className="w-1/3"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder="https://…"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover link"
                onClick={() => setLinks((ls) => ls.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4 text-danger" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinks((ls) => [...ls, { label: '', url: '' }])}
          >
            <Plus className="size-4" /> Adicionar link
          </Button>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteItem.isPending}
          >
            <Trash2 className="size-4 text-danger" /> Excluir
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={updateItem.isPending}>
              {updateItem.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
