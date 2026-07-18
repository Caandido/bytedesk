import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Code2 } from 'lucide-react';
import type { Study, StudySection } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Markdown } from '@/components/Markdown';
import {
  useAddSection,
  useUpdateSection,
  useDeleteSection,
} from './useStudies';

/**
 * Seções de conteúdo de um estudo: cards com título + Markdown (com realce de
 * código). Cada seção pode guardar definições, exemplos de código, gotchas, etc.
 */
export function StudySections({ study }: { study: Study }) {
  const sections = study.sections ?? [];
  const addSection = useAddSection(study.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4" /> Seções
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSection.mutate({ title: 'Nova seção' })}
            disabled={addSection.isPending}
          >
            {addSection.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma seção ainda. Use seções para organizar conteúdo rico —
            definições, exemplos de código (com realce), tabelas, etc.
          </p>
        )}
        {sections.map((section) => (
          <SectionCard key={section.id} studyId={study.id} section={section} />
        ))}
      </CardContent>
    </Card>
  );
}

function SectionCard({
  studyId,
  section,
}: {
  studyId: string;
  section: StudySection;
}) {
  const updateSection = useUpdateSection(studyId);
  const deleteSection = useDeleteSection(studyId);

  const [editing, setEditing] = useState(section.title === 'Nova seção' && !section.content);
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  useEffect(() => {
    if (editing) {
      setTitle(section.title);
      setContent(section.content);
    }
  }, [editing, section.title, section.content]);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateSection.mutate(
      { sectionId: section.id, input: { title: trimmed, content } },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Excluir a seção "${section.title}"?`)) {
      deleteSection.mutate(section.id);
    }
  };

  return (
    <div className="rounded-md border border-border p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        {editing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da seção"
            maxLength={200}
            className="max-w-xs font-medium"
            autoFocus
          />
        ) : (
          <h4 className="font-medium">{section.title}</h4>
        )}
        <div className="flex shrink-0 gap-1">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={updateSection.isPending}
              >
                {updateSection.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Editar seção"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Excluir seção"
                onClick={handleDelete}
                disabled={deleteSection.isPending}
              >
                <Trash2 className="size-4 text-danger" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'Conteúdo em Markdown…\n\n```ts\nconst x = 1;\n```'}
          rows={10}
          className="font-mono text-xs"
        />
      ) : section.content.trim() ? (
        <Markdown content={section.content} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Seção vazia. Clique no lápis para editar.
        </p>
      )}
    </div>
  );
}
