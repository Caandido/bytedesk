import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  createIdeaSchema,
  IDEA_RATING_LABELS,
  IDEA_STATUS_LABELS,
  type Idea,
  type IdeaRating,
  type IdeaStatus,
  type CreateIdeaInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateIdea, useUpdateIdea } from './useIdeas';

interface IdeaDialogProps {
  projectId: string;
  open: boolean;
  idea: Idea | null;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  priority: IdeaRating;
  impact: IdeaRating;
  complexity: IdeaRating;
  status: IdeaStatus;
  tags: string;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  impact: 'MEDIUM',
  complexity: 'MEDIUM',
  status: 'NEW',
  tags: '',
};

/** Modal de criação/edição de uma ideia. */
export function IdeaDialog({ projectId, open, idea, onClose }: IdeaDialogProps) {
  const isEdit = Boolean(idea);
  const createIdea = useCreateIdea(projectId);
  const updateIdea = useUpdateIdea(projectId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      idea
        ? {
            title: idea.title,
            description: idea.description,
            priority: idea.priority,
            impact: idea.impact,
            complexity: idea.complexity,
            status: idea.status,
            tags: idea.tags.join(', '),
          }
        : EMPTY,
    );
  }, [open, idea]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: CreateIdeaInput = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      impact: form.impact,
      complexity: form.complexity,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const parsed = createIdeaSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    const onSuccess = () => onClose();
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (idea) {
      updateIdea.mutate({ ideaId: idea.id, input: parsed.data }, { onSuccess, onError });
    } else {
      createIdea.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createIdea.isPending || updateIdea.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar ideia' : 'Nova ideia'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Título" required>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex.: Modo offline"
            maxLength={200}
            autoFocus
          />
        </Field>

        <Field label="Descrição">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Prioridade">
            <RatingSelect
              value={form.priority}
              onChange={(v) => set('priority', v)}
            />
          </Field>
          <Field label="Impacto">
            <RatingSelect value={form.impact} onChange={(v) => set('impact', v)} />
          </Field>
          <Field label="Complexidade">
            <RatingSelect
              value={form.complexity}
              onChange={(v) => set('complexity', v)}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value as IdeaStatus)}
            >
              {Object.entries(IDEA_STATUS_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Tags" hint="Separe por vírgula.">
          <Input
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="pwa, ux"
          />
        </Field>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar ideia'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function RatingSelect({
  value,
  onChange,
}: {
  value: IdeaRating;
  onChange: (v: IdeaRating) => void;
}) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as IdeaRating)}>
      {Object.entries(IDEA_RATING_LABELS).map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </Select>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
