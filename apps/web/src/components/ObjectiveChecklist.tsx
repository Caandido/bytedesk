import { useState, type FormEvent } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Forma mínima de um item de checklist (compartilhada entre Estudos e Projetos). */
export interface ObjectiveItem {
  id: string;
  title: string;
  done: boolean;
}

interface ObjectiveChecklistProps {
  objectives: ObjectiveItem[];
  onAdd: (title: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  adding?: boolean;
  title?: string;
}

/**
 * Checklist de objetivos reutilizável: barra de progresso, toggle, remoção e adição.
 * Recebe callbacks para não acoplar a uma feature específica (Estudos, Projetos, …).
 */
export function ObjectiveChecklist({
  objectives,
  onAdd,
  onToggle,
  onDelete,
  adding = false,
  title = 'Objetivos',
}: ObjectiveChecklistProps) {
  const [draft, setDraft] = useState('');
  const done = objectives.filter((o) => o.done).length;
  const progress = objectives.length
    ? Math.round((done / objectives.length) * 100)
    : 0;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {objectives.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {done}/{objectives.length}
            </span>
          )}
        </div>
        {objectives.length > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {objectives.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum objetivo ainda. Adicione o primeiro abaixo.
          </p>
        )}

        <ul className="space-y-1">
          {objectives.map((obj) => (
            <li
              key={obj.id}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50"
            >
              <input
                type="checkbox"
                checked={obj.done}
                onChange={() => onToggle(obj.id, !obj.done)}
                className="size-4 shrink-0 cursor-pointer accent-primary"
                aria-label={obj.title}
              />
              <span
                className={cn(
                  'flex-1 text-sm',
                  obj.done && 'text-muted-foreground line-through',
                )}
              >
                {obj.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Remover ${obj.title}`}
                onClick={() => onDelete(obj.id)}
              >
                <Trash2 className="size-3.5 text-danger" />
              </Button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Novo objetivo…"
            maxLength={200}
          />
          <Button type="submit" size="icon" disabled={adding}>
            {adding ? (
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
