import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  createDiaryEntrySchema,
  MOOD_EMOJI,
  type DiaryEntry,
  type CreateDiaryEntryInput,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/features/projects/useProjects';
import {
  useCreateDiaryEntry,
  useUpdateDiaryEntry,
  useDeleteDiaryEntry,
} from './useDiary';

interface DiaryDialogProps {
  open: boolean;
  entry: DiaryEntry | null;
  onClose: () => void;
}

interface FormState {
  date: string;
  minutesSpent: string;
  done: string;
  problems: string;
  solutions: string;
  nextSteps: string;
  mood: number;
  productivity: number;
  projectId: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): FormState => ({
  date: todayISO(),
  minutesSpent: '',
  done: '',
  problems: '',
  solutions: '',
  nextSteps: '',
  mood: 3,
  productivity: 3,
  projectId: '',
});

/** Modal de criação/edição de um registro do diário. */
export function DiaryDialog({ open, entry, onClose }: DiaryDialogProps) {
  const isEdit = Boolean(entry);
  const projects = useProjects();
  const createEntry = useCreateDiaryEntry();
  const updateEntry = useUpdateDiaryEntry();
  const deleteEntry = useDeleteDiaryEntry();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (entry) {
      setForm({
        date: new Date(entry.date).toISOString().slice(0, 10),
        minutesSpent: entry.minutesSpent ? String(entry.minutesSpent) : '',
        done: entry.done,
        problems: entry.problems,
        solutions: entry.solutions,
        nextSteps: entry.nextSteps,
        mood: entry.mood,
        productivity: entry.productivity,
        projectId: entry.projectId ?? '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, entry]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: CreateDiaryEntryInput = {
      date: new Date(form.date),
      minutesSpent: form.minutesSpent ? Number(form.minutesSpent) : 0,
      done: form.done,
      problems: form.problems,
      solutions: form.solutions,
      nextSteps: form.nextSteps,
      mood: form.mood,
      productivity: form.productivity,
      projectId: form.projectId || null,
    };

    const parsed = createDiaryEntrySchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    const onSuccess = () => onClose();
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (entry) {
      updateEntry.mutate({ id: entry.id, input: parsed.data }, { onSuccess, onError });
    } else {
      createEntry.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const handleDelete = () => {
    if (!entry) return;
    if (window.confirm('Excluir este registro?')) {
      deleteEntry.mutate(entry.id, { onSuccess: onClose });
    }
  };

  const saving = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar registro' : 'Novo registro'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tempo (min)</Label>
            <Input
              type="number"
              min={0}
              value={form.minutesSpent}
              onChange={(e) => set('minutesSpent', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Projeto</Label>
            <Select
              value={form.projectId}
              onChange={(e) => set('projectId', e.target.value)}
            >
              <option value="">Sem projeto</option>
              {(projects.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Humor</Label>
            <div className="flex gap-1">
              {MOOD_EMOJI.map((emoji, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('mood', value)}
                    aria-label={`Humor ${value}`}
                    aria-pressed={form.mood === value}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-md border text-lg transition-colors',
                      form.mood === value
                        ? 'border-primary bg-primary/10'
                        : 'border-border opacity-50 hover:opacity-100',
                    )}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Produtividade</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('productivity', value)}
                  aria-label={`Produtividade ${value}`}
                  aria-pressed={form.productivity === value}
                  className={cn(
                    'size-9 rounded-md border text-sm font-medium transition-colors',
                    form.productivity === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>O que foi feito</Label>
          <Textarea
            value={form.done}
            onChange={(e) => set('done', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Problemas encontrados</Label>
            <Textarea
              value={form.problems}
              onChange={(e) => set('problems', e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Como resolveu</Label>
            <Textarea
              value={form.solutions}
              onChange={(e) => set('solutions', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Próximos passos</Label>
          <Textarea
            value={form.nextSteps}
            onChange={(e) => set('nextSteps', e.target.value)}
            rows={2}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteEntry.isPending}
            >
              <Trash2 className="size-4 text-danger" /> Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Registrar'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
