import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import {
  createStudySchema,
  STUDY_STATUS_LABELS,
  STUDY_LEVEL_LABELS,
  type CreateStudyInput,
  type Link as StudyLink,
  type StudyStatus,
  type StudyLevel,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  useStudy,
  useCreateStudy,
  useUpdateStudy,
} from '@/features/studies/useStudies';

/** Estado local do formulário (strings — convertidas ao submeter). */
interface FormState {
  name: string;
  category: string;
  technology: string;
  status: StudyStatus;
  level: StudyLevel;
  hoursStudied: string;
  startDate: string;
  tags: string;
  description: string;
  links: StudyLink[];
}

const EMPTY: FormState = {
  name: '',
  category: '',
  technology: '',
  status: 'PLANNED',
  level: 'BEGINNER',
  hoursStudied: '',
  startDate: '',
  tags: '',
  description: '',
  links: [],
};

/**
 * Formulário de criação/edição de estudo. Validação com o schema Zod compartilhado
 * (`createStudySchema.safeParse`) antes de enviar — mesma fonte da validação do back.
 */
export function StudyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useStudy(id);
  const createStudy = useCreateStudy();
  const updateStudy = useUpdateStudy(id ?? '');

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Preenche o formulário ao carregar um estudo existente (modo edição).
  useEffect(() => {
    if (existing.data) {
      const s = existing.data;
      setForm({
        name: s.name,
        category: s.category,
        technology: s.technology,
        status: s.status,
        level: s.level,
        hoursStudied: s.hoursStudied ? String(s.hoursStudied) : '',
        startDate: s.startDate
          ? new Date(s.startDate).toISOString().slice(0, 10)
          : '',
        tags: s.tags.join(', '),
        description: s.description,
        links: s.links,
      });
    }
  }, [existing.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const payload: CreateStudyInput = {
      name: form.name,
      category: form.category,
      technology: form.technology,
      status: form.status,
      level: form.level,
      hoursStudied: form.hoursStudied ? Number(form.hoursStudied) : 0,
      startDate: form.startDate ? new Date(form.startDate) : null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: form.description,
      links: form.links.filter((l) => l.label.trim() && l.url.trim()),
    };

    const parsed = createStudySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const onSuccess = (study: { id: string }) =>
      navigate(`/estudos/${study.id}`);
    const onError = (err: unknown) =>
      setApiError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (isEdit) {
      updateStudy.mutate(parsed.data, { onSuccess, onError });
    } else {
      createStudy.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createStudy.isPending || updateStudy.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }

  if (isEdit && existing.isError) {
    return <p className="text-sm text-danger">Estudo não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={isEdit ? `/estudos/${id}` : '/estudos'}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar estudo' : 'Novo estudo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Field label="Nome" error={errors.name} required>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex.: React Hooks"
                maxLength={200}
                autoFocus
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria" error={errors.category}>
                <Input
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Ex.: Frontend"
                />
              </Field>
              <Field label="Tecnologia" error={errors.technology}>
                <Input
                  value={form.technology}
                  onChange={(e) => set('technology', e.target.value)}
                  placeholder="Ex.: React"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as StudyStatus)}
                >
                  {Object.entries(STUDY_STATUS_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Nível">
                <Select
                  value={form.level}
                  onChange={(e) => set('level', e.target.value as StudyLevel)}
                >
                  {Object.entries(STUDY_LEVEL_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Horas estudadas" error={errors.hoursStudied}>
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.hoursStudied}
                  onChange={(e) => set('hoursStudied', e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Data de início" error={errors.startDate}>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Tags"
              error={errors.tags}
              hint="Separe por vírgula (ex.: frontend, hooks)"
            >
              <Input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="frontend, hooks"
              />
            </Field>

            <Field label="Descrição" error={errors.description}>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Resumo do que será estudado…"
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>

        <LinksEditor
          links={form.links}
          onChange={(links) => set('links', links)}
        />

        {apiError && <p className="text-sm text-danger">{apiError}</p>}

        <div className="flex justify-end gap-2">
          <Link
            to={isEdit ? `/estudos/${id}` : '/estudos'}
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Criar estudo'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function LinksEditor({
  links,
  onChange,
}: {
  links: StudyLink[];
  onChange: (links: StudyLink[]) => void;
}) {
  const update = (i: number, patch: Partial<StudyLink>) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const add = () => onChange([...links, { label: '', url: '' }]);

  return (
    <Card>
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-base">Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum link. Adicione documentações, vídeos ou artigos.
          </p>
        )}
        {links.map((link, i) => (
          <div key={i} className="flex items-start gap-2">
            <Input
              value={link.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Rótulo (ex.: MDN)"
              className="w-1/3"
            />
            <Input
              value={link.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://…"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover link"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Adicionar link
        </Button>
      </CardContent>
    </Card>
  );
}
