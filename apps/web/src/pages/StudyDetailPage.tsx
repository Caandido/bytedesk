import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  Calendar,
  ExternalLink,
  FileText,
  Eye,
} from 'lucide-react';
import type { Study } from '@devflow/shared';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import { ObjectiveChecklist } from '@/components/ObjectiveChecklist';
import { StudyStatusBadge, StudyLevelBadge } from '@/features/studies/StudyMeta';
import { StudySections } from '@/features/studies/StudySections';
import { StudyCodeFiles } from '@/features/studies/StudyCodeFiles';
import { StudyProjects } from '@/features/studies/StudyProjects';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import {
  useStudy,
  useDeleteStudy,
  useUpdateStudy,
  useAddObjective,
  useUpdateObjective,
  useDeleteObjective,
} from '@/features/studies/useStudies';

/** Detalhe de um estudo: metadados, objetivos (checklist) e anotações Markdown. */
export function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const study = useStudy(id);
  const deleteStudy = useDeleteStudy();

  if (study.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando…
      </p>
    );
  }
  if (study.isError || !study.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">Estudo não encontrado.</p>
        <Link to="/estudos" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>
    );
  }

  const s = study.data;

  const handleDelete = () => {
    if (window.confirm(`Excluir o estudo "${s.name}"?`)) {
      deleteStudy.mutate(s.id, { onSuccess: () => navigate('/estudos') });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            to="/estudos"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{s.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StudyStatusBadge status={s.status} />
              <StudyLevelBadge level={s.level} />
              {s.technology && <Badge variant="outline">{s.technology}</Badge>}
              {s.category && <Badge variant="default">{s.category}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <FavoriteButton
            type="STUDY"
            entityId={s.id}
            title={s.name}
            subtitle={s.technology}
            url={`/estudos/${s.id}`}
          />
          <Link
            to={`/estudos/${s.id}/editar`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Pencil className="size-4" /> Editar
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteStudy.isPending}
          >
            <Trash2 className="size-4 text-danger" />
          </Button>
        </div>
      </div>

      {/* Metadados */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {s.hoursStudied}h estudadas
        </span>
        {s.startDate && (
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" /> Início em{' '}
            {new Date(s.startDate).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      {s.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {s.tags.map((tag) => (
            <Badge key={tag} variant="default">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {s.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{s.description}</p>
          </CardContent>
        </Card>
      )}

      {s.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {s.links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-info underline underline-offset-2"
                  >
                    <ExternalLink className="size-3.5" /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <ObjectivesSection study={s} />
      <StudyCodeFiles study={s} />
      <StudyProjects study={s} />
      <StudySections study={s} />
      <NotesSection study={s} />
    </div>
  );
}

// ─── Objetivos ─────────────────────────────────────────────────────────────────

function ObjectivesSection({ study }: { study: Study }) {
  const addObjective = useAddObjective(study.id);
  const updateObjective = useUpdateObjective(study.id);
  const deleteObjective = useDeleteObjective(study.id);

  return (
    <ObjectiveChecklist
      objectives={study.objectives ?? []}
      adding={addObjective.isPending}
      onAdd={(title) => addObjective.mutate({ title })}
      onToggle={(objectiveId, done) =>
        updateObjective.mutate({ objectiveId, input: { done } })
      }
      onDelete={(objectiveId) => deleteObjective.mutate(objectiveId)}
    />
  );
}

// ─── Anotações (Markdown) ───────────────────────────────────────────────────────

function NotesSection({ study }: { study: Study }) {
  const updateStudy = useUpdateStudy(study.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(study.notes);

  // Se as notas mudarem no servidor (ex.: refetch), sincroniza enquanto não edita.
  useEffect(() => {
    if (!editing) setDraft(study.notes);
  }, [study.notes, editing]);

  const save = () => {
    updateStudy.mutate(
      { notes: draft },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> Anotações
          </CardTitle>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(study.notes);
                  setEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={updateStudy.isPending}
              >
                {updateStudy.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Salvar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escreva em Markdown… (títulos, listas, `código`, tabelas)"
              rows={12}
              className="font-mono text-xs"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> Suporta Markdown (GFM): títulos, listas,
              checklists, tabelas e código.
            </p>
          </div>
        ) : study.notes.trim() ? (
          <Markdown content={study.notes} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem anotações ainda. Clique em “Editar” para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
