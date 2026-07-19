import { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';
import type { Study, StudyCodeFile } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/Markdown';
import {
  useAddCodeFile,
  useUpdateCodeFile,
  useDeleteCodeFile,
} from './useStudies';

/** Arquivos de código guardados no estudo — com realce de sintaxe e copiar. */
export function StudyCodeFiles({ study }: { study: Study }) {
  const [adding, setAdding] = useState(false);
  const files = study.codeFiles ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code2 className="size-4" /> Códigos{' '}
          {files.length > 0 && (
            <span className="text-muted-foreground">({files.length})</span>
          )}
        </CardTitle>
        {!adding && (
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {files.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            Nenhum código ainda. Guarde snippets e arquivos deste estudo.
          </p>
        )}
        {adding && (
          <CodeEditor
            studyId={study.id}
            onCancel={() => setAdding(false)}
            onSaved={() => setAdding(false)}
          />
        )}
        {files.map((f) => (
          <CodeFileCard key={f.id} studyId={study.id} file={f} />
        ))}
      </CardContent>
    </Card>
  );
}

function CodeFileCard({
  studyId,
  file,
}: {
  studyId: string;
  file: StudyCodeFile;
}) {
  const deleteFile = useDeleteCodeFile(studyId);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (editing) {
    return (
      <CodeEditor
        studyId={studyId}
        file={file}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  const copy = () => {
    void navigator.clipboard.writeText(file.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium">
          {file.name}
        </span>
        {file.language && <Badge variant="outline">{file.language}</Badge>}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title="Copiar código"
          onClick={copy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title="Editar"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title="Excluir"
          disabled={deleteFile.isPending}
          onClick={() => {
            if (window.confirm(`Excluir o arquivo "${file.name}"?`)) {
              deleteFile.mutate(file.id);
            }
          }}
        >
          <Trash2 className="size-4 text-danger" />
        </Button>
      </div>
      <div className="[&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0">
        {file.content.trim() ? (
          <Markdown content={`~~~${file.language}\n${file.content}\n~~~`} />
        ) : (
          <p className="p-3 text-xs text-muted-foreground">(vazio)</p>
        )}
      </div>
    </div>
  );
}

/** Editor de um arquivo de código (usado para criar e editar). */
function CodeEditor({
  studyId,
  file,
  onCancel,
  onSaved,
}: {
  studyId: string;
  file?: StudyCodeFile;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const addFile = useAddCodeFile(studyId);
  const updateFile = useUpdateCodeFile(studyId);
  const [name, setName] = useState(file?.name ?? '');
  const [language, setLanguage] = useState(file?.language ?? '');
  const [content, setContent] = useState(file?.content ?? '');
  const pending = addFile.isPending || updateFile.isPending;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const input = { name: trimmed, language: language.trim(), content };
    if (file) {
      updateFile.mutate({ fileId: file.id, input }, { onSuccess: onSaved });
    } else {
      addFile.mutate(input, { onSuccess: onSaved });
    }
  };

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do arquivo (ex.: exemplo.tsx)"
          className="flex-1 font-mono text-xs"
          autoFocus
        />
        <Input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="Linguagem (ex.: tsx, python)"
          className="sm:w-48"
        />
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Cole seu código aqui…"
        rows={10}
        className="font-mono text-xs"
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={save} disabled={pending || !name.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}
