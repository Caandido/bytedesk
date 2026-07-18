import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  createBugSchema,
  BUG_SEVERITY_LABELS,
  BUG_PRIORITY_LABELS,
  BUG_STATUS_LABELS,
  type Bug,
  type BugSeverity,
  type BugPriority,
  type BugStatus,
  type CreateBugInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateBug, useUpdateBug } from './useBugs';

interface BugDialogProps {
  projectId: string;
  open: boolean;
  bug: Bug | null;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  version: string;
  module: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  logs: string;
  fix: string;
  fixedBy: string;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  severity: 'MEDIUM',
  priority: 'MEDIUM',
  status: 'OPEN',
  version: '',
  module: '',
  stepsToReproduce: '',
  expectedResult: '',
  actualResult: '',
  logs: '',
  fix: '',
  fixedBy: '',
};

/** Modal de criação/edição de bug com todos os campos da spec. */
export function BugDialog({ projectId, open, bug, onClose }: BugDialogProps) {
  const isEdit = Boolean(bug);
  const createBug = useCreateBug(projectId);
  const updateBug = useUpdateBug(projectId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(bug ? { ...EMPTY, ...bug } : EMPTY);
  }, [open, bug]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = createBugSchema.safeParse(form as CreateBugInput);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    const onSuccess = () => onClose();
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (bug) {
      updateBug.mutate({ bugId: bug.id, input: parsed.data }, { onSuccess, onError });
    } else {
      createBug.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createBug.isPending || updateBug.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar bug' : 'Novo bug'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Título" required>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex.: Botão Login quebra com email vazio"
            maxLength={200}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Severidade">
            <Select
              value={form.severity}
              onChange={(e) => set('severity', e.target.value as BugSeverity)}
            >
              {Object.entries(BUG_SEVERITY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as BugPriority)}
            >
              {Object.entries(BUG_PRIORITY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value as BugStatus)}
            >
              {Object.entries(BUG_STATUS_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Versão">
            <Input
              value={form.version}
              onChange={(e) => set('version', e.target.value)}
              placeholder="0.8.2"
            />
          </Field>
          <Field label="Módulo afetado">
            <Input
              value={form.module}
              onChange={(e) => set('module', e.target.value)}
              placeholder="Autenticação"
            />
          </Field>
        </div>

        <Field label="Descrição">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
          />
        </Field>

        <Field label="Passos para reproduzir">
          <Textarea
            value={form.stepsToReproduce}
            onChange={(e) => set('stepsToReproduce', e.target.value)}
            rows={3}
            placeholder={'1. …\n2. …'}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Resultado esperado">
            <Textarea
              value={form.expectedResult}
              onChange={(e) => set('expectedResult', e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Resultado obtido">
            <Textarea
              value={form.actualResult}
              onChange={(e) => set('actualResult', e.target.value)}
              rows={2}
            />
          </Field>
        </div>

        <Field label="Logs">
          <Textarea
            value={form.logs}
            onChange={(e) => set('logs', e.target.value)}
            rows={2}
            className="font-mono text-xs"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Correção">
            <Textarea
              value={form.fix}
              onChange={(e) => set('fix', e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Quem corrigiu">
            <Input
              value={form.fixedBy}
              onChange={(e) => set('fixedBy', e.target.value)}
              placeholder="Nome"
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
            {isEdit ? 'Salvar' : 'Criar bug'}
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
