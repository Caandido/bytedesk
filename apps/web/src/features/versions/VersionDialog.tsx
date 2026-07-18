import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  createVersionSchema,
  type ProjectVersion,
  type CreateVersionInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateVersion, useUpdateVersion } from './useVersions';

interface VersionDialogProps {
  projectId: string;
  open: boolean;
  version: ProjectVersion | null;
  onClose: () => void;
}

interface FormState {
  version: string;
  releasedAt: string;
  description: string;
  features: string;
  fixes: string;
  improvements: string;
  breaking: string;
}

const EMPTY: FormState = {
  version: '',
  releasedAt: '',
  description: '',
  features: '',
  fixes: '',
  improvements: '',
  breaking: '',
};

/** Modal de criação/edição de uma versão do projeto. */
export function VersionDialog({
  projectId,
  open,
  version,
  onClose,
}: VersionDialogProps) {
  const isEdit = Boolean(version);
  const createVersion = useCreateVersion(projectId);
  const updateVersion = useUpdateVersion(projectId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      version
        ? {
            version: version.version,
            releasedAt: version.releasedAt
              ? new Date(version.releasedAt).toISOString().slice(0, 10)
              : '',
            description: version.description,
            features: version.features,
            fixes: version.fixes,
            improvements: version.improvements,
            breaking: version.breaking,
          }
        : EMPTY,
    );
  }, [open, version]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateVersionInput = {
      version: form.version,
      releasedAt: form.releasedAt ? new Date(form.releasedAt) : null,
      description: form.description,
      features: form.features,
      fixes: form.fixes,
      improvements: form.improvements,
      breaking: form.breaking,
    };

    const parsed = createVersionSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    const onSuccess = () => onClose();
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (version) {
      updateVersion.mutate(
        { versionId: version.id, input: parsed.data },
        { onSuccess, onError },
      );
    } else {
      createVersion.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createVersion.isPending || updateVersion.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar versão' : 'Nova versão'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Versão" required>
            <Input
              value={form.version}
              onChange={(e) => set('version', e.target.value)}
              placeholder="1.3.0"
              maxLength={40}
              autoFocus
            />
          </Field>
          <Field label="Data de lançamento">
            <Input
              type="date"
              value={form.releasedAt}
              onChange={(e) => set('releasedAt', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Descrição">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Resumo desta versão…"
          />
        </Field>

        <p className="text-xs text-muted-foreground">
          Nas seções abaixo, escreva <strong>um item por linha</strong> — viram os
          bullets do changelog.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Novidades">
            <Textarea
              value={form.features}
              onChange={(e) => set('features', e.target.value)}
              rows={3}
              placeholder={'Sistema de login\nTema escuro'}
            />
          </Field>
          <Field label="Correções">
            <Textarea
              value={form.fixes}
              onChange={(e) => set('fixes', e.target.value)}
              rows={3}
              placeholder={'Bug no cadastro'}
            />
          </Field>
          <Field label="Melhorias">
            <Textarea
              value={form.improvements}
              onChange={(e) => set('improvements', e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Breaking changes">
            <Textarea
              value={form.breaking}
              onChange={(e) => set('breaking', e.target.value)}
              rows={3}
            />
          </Field>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar versão'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
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
    </div>
  );
}
