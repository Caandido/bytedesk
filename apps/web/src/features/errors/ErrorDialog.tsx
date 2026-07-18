import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  createKnownErrorSchema,
  type KnownError,
  type CreateKnownErrorInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateKnownError, useUpdateKnownError } from './useErrors';

interface ErrorDialogProps {
  open: boolean;
  error: KnownError | null;
  onClose: () => void;
}

interface FormState {
  title: string;
  cause: string;
  solution: string;
  technology: string;
  category: string;
  tags: string;
}

const EMPTY: FormState = {
  title: '',
  cause: '',
  solution: '',
  technology: '',
  category: '',
  tags: '',
};

/** Modal de criação/edição de um erro conhecido. */
export function ErrorDialog({ open, error, onClose }: ErrorDialogProps) {
  const isEdit = Boolean(error);
  const createError = useCreateKnownError();
  const updateError = useUpdateKnownError();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setForm(
      error
        ? {
            title: error.title,
            cause: error.cause,
            solution: error.solution,
            technology: error.technology,
            category: error.category,
            tags: error.tags.join(', '),
          }
        : EMPTY,
    );
  }, [open, error]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    const input: CreateKnownErrorInput = {
      title: form.title,
      cause: form.cause,
      solution: form.solution,
      technology: form.technology,
      category: form.category,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const parsed = createKnownErrorSchema.safeParse(input);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    const onSuccess = () => onClose();
    const onError = (e2: unknown) =>
      setErr(e2 instanceof Error ? e2.message : 'Erro ao salvar.');

    if (error) {
      updateError.mutate({ id: error.id, input: parsed.data }, { onSuccess, onError });
    } else {
      createError.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createError.isPending || updateError.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar erro' : 'Novo erro'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Erro" required>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex.: CORS bloqueando requisição"
            maxLength={300}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tecnologia">
            <Input
              value={form.technology}
              onChange={(e) => set('technology', e.target.value)}
              placeholder="Ex.: NestJS"
            />
          </Field>
          <Field label="Categoria">
            <Input
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Ex.: Backend"
            />
          </Field>
        </div>

        <Field label="Motivo / causa">
          <Textarea
            value={form.cause}
            onChange={(e) => set('cause', e.target.value)}
            rows={2}
          />
        </Field>

        <Field label="Solução" hint="Suporta Markdown (código, passos, etc.).">
          <Textarea
            value={form.solution}
            onChange={(e) => set('solution', e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
        </Field>

        <Field label="Tags" hint="Separe por vírgula.">
          <Input
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="cors, http"
          />
        </Field>

        {err && <p className="text-xs text-danger">{err}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Dialog>
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
