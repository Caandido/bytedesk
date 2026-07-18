import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  createRoadmapSchema,
  type CreateRoadmapInput,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useRoadmap,
  useCreateRoadmap,
  useUpdateRoadmap,
} from '@/features/roadmaps/useRoadmaps';

/** Formulário de criação/edição de roadmap, validado com o schema Zod compartilhado. */
export function RoadmapFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useRoadmap(id);
  const createRoadmap = useCreateRoadmap();
  const updateRoadmap = useUpdateRoadmap(id ?? '');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setName(existing.data.name);
      setCategory(existing.data.category);
      setTags(existing.data.tags.join(', '));
      setDescription(existing.data.description);
    }
  }, [existing.data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const payload: CreateRoadmapInput = {
      name,
      category,
      description,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const parsed = createRoadmapSchema.safeParse(payload);
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

    const onSuccess = (roadmap: { id: string }) =>
      navigate(`/roadmaps/${roadmap.id}`);
    const onError = (err: unknown) =>
      setApiError(err instanceof Error ? err.message : 'Erro ao salvar.');

    if (isEdit) {
      updateRoadmap.mutate(parsed.data, { onSuccess, onError });
    } else {
      createRoadmap.mutate(parsed.data, { onSuccess, onError });
    }
  };

  const saving = createRoadmap.isPending || updateRoadmap.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (isEdit && existing.isError) {
    return <p className="text-sm text-danger">Roadmap não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={isEdit ? `/roadmaps/${id}` : '/roadmaps'}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar roadmap' : 'Novo roadmap'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label>
                Nome<span className="ml-0.5 text-danger">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Frontend"
                maxLength={200}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex.: Trilha de estudos"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="frontend, web"
              />
              <p className="text-xs text-muted-foreground">
                Separe por vírgula.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sobre esta trilha…"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {apiError && <p className="text-sm text-danger">{apiError}</p>}

        <div className="flex justify-end gap-2">
          <Link
            to={isEdit ? `/roadmaps/${id}` : '/roadmaps'}
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Criar roadmap'}
          </Button>
        </div>
      </form>
    </div>
  );
}
