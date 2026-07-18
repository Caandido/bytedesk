import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  createProjectSchema,
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  type CreateProjectInput,
  type ProjectStatus,
  type ProjectPriority,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  useProject,
  useCreateProject,
  useUpdateProject,
} from '@/features/projects/useProjects';

interface FormState {
  name: string;
  client: string;
  category: string;
  technologies: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  version: string;
  startDate: string;
  deadline: string;
  repoUrl: string;
  figmaUrl: string;
  deployUrl: string;
  docsUrl: string;
  description: string;
}

const EMPTY: FormState = {
  name: '',
  client: '',
  category: '',
  technologies: '',
  status: 'PLANNING',
  priority: 'MEDIUM',
  version: '',
  startDate: '',
  deadline: '',
  repoUrl: '',
  figmaUrl: '',
  deployUrl: '',
  docsUrl: '',
  description: '',
};

/**
 * Formulário de criação/edição de projeto. Valida com o schema Zod compartilhado
 * (`createProjectSchema.safeParse`) antes de enviar.
 */
export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useProject(id);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(id ?? '');

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      const p = existing.data;
      setForm({
        name: p.name,
        client: p.client,
        category: p.category,
        technologies: p.technologies.join(', '),
        status: p.status,
        priority: p.priority,
        version: p.version,
        startDate: p.startDate
          ? new Date(p.startDate).toISOString().slice(0, 10)
          : '',
        deadline: p.deadline
          ? new Date(p.deadline).toISOString().slice(0, 10)
          : '',
        repoUrl: p.repoUrl,
        figmaUrl: p.figmaUrl,
        deployUrl: p.deployUrl,
        docsUrl: p.docsUrl,
        description: p.description,
      });
    }
  }, [existing.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const payload: CreateProjectInput = {
      name: form.name,
      client: form.client,
      category: form.category,
      technologies: form.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
      priority: form.priority,
      version: form.version,
      startDate: form.startDate ? new Date(form.startDate) : null,
      deadline: form.deadline ? new Date(form.deadline) : null,
      repoUrl: form.repoUrl.trim(),
      figmaUrl: form.figmaUrl.trim(),
      deployUrl: form.deployUrl.trim(),
      docsUrl: form.docsUrl.trim(),
      description: form.description,
    };

    const parsed = createProjectSchema.safeParse(payload);
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

    const onSuccess = (project: { id: string }) =>
      navigate(`/projetos/${project.id}`);
    const onError = (err: unknown) =>
      setApiError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (isEdit) {
      updateProject.mutate(parsed.data, { onSuccess, onError });
    } else {
      createProject.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createProject.isPending || updateProject.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (isEdit && existing.isError) {
    return <p className="text-sm text-danger">Projeto não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={isEdit ? `/projetos/${id}` : '/projetos'}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar projeto' : 'Novo projeto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Field label="Nome" error={errors.name} required>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex.: ByteDesk"
                maxLength={200}
                autoFocus
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" error={errors.client}>
                <Input
                  value={form.client}
                  onChange={(e) => set('client', e.target.value)}
                  placeholder="Ex.: Interno"
                />
              </Field>
              <Field label="Categoria" error={errors.category}>
                <Input
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Ex.: SaaS"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) =>
                    set('status', e.target.value as ProjectStatus)
                  }
                >
                  {Object.entries(PROJECT_STATUS_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Prioridade">
                <Select
                  value={form.priority}
                  onChange={(e) =>
                    set('priority', e.target.value as ProjectPriority)
                  }
                >
                  {Object.entries(PROJECT_PRIORITY_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Versão" error={errors.version}>
                <Input
                  value={form.version}
                  onChange={(e) => set('version', e.target.value)}
                  placeholder="0.1.0"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data de início" error={errors.startDate}>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </Field>
              <Field label="Prazo" error={errors.deadline}>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set('deadline', e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Tecnologias"
              error={errors.technologies}
              hint="Separe por vírgula (ex.: React, NestJS, Postgres)"
            >
              <Input
                value={form.technologies}
                onChange={(e) => set('technologies', e.target.value)}
                placeholder="React, NestJS, Postgres"
              />
            </Field>

            <Field label="Descrição / Visão geral" error={errors.description}>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Objetivo do projeto, escopo, arquitetura… (Markdown)"
                rows={4}
                className="font-mono text-xs"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-base">Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Repositório (GitHub)" error={errors.repoUrl}>
              <Input
                value={form.repoUrl}
                onChange={(e) => set('repoUrl', e.target.value)}
                placeholder="https://github.com/…"
              />
            </Field>
            <Field label="Figma" error={errors.figmaUrl}>
              <Input
                value={form.figmaUrl}
                onChange={(e) => set('figmaUrl', e.target.value)}
                placeholder="https://figma.com/…"
              />
            </Field>
            <Field label="Deploy" error={errors.deployUrl}>
              <Input
                value={form.deployUrl}
                onChange={(e) => set('deployUrl', e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Documentação" error={errors.docsUrl}>
              <Input
                value={form.docsUrl}
                onChange={(e) => set('docsUrl', e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </CardContent>
        </Card>

        {apiError && <p className="text-sm text-danger">{apiError}</p>}

        <div className="flex justify-end gap-2">
          <Link
            to={isEdit ? `/projetos/${id}` : '/projetos'}
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Criar projeto'}
          </Button>
        </div>
      </form>
    </div>
  );
}

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
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
