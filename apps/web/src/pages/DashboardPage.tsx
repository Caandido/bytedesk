import { useState, type FormEvent } from 'react';
import { CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHealth } from '@/features/health/useHealth';
import {
  useNotes,
  useCreateNote,
  useDeleteNote,
} from '@/features/notes/useNotes';

/**
 * Dashboard da fundação. Ainda não traz as estatísticas reais da spec — serve como
 * prova viva da integração front ↔ API ↔ SQLite (status do backend + CRUD de notas).
 */
export function DashboardPage() {
  const health = useHealth();
  const notes = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createNote.mutate({ title: trimmed }, { onSuccess: () => setTitle('') });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Fundação do DevFlow — integração front ↔ back ativa.
        </p>
      </div>

      {/* Status do backend */}
      <Card>
        <CardHeader>
          <CardTitle>Status da API</CardTitle>
          <CardDescription>GET /api/health</CardDescription>
        </CardHeader>
        <CardContent>
          {health.isLoading && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Conectando…
            </span>
          )}
          {health.isError && (
            <span className="flex items-center gap-2 text-danger">
              <XCircle className="size-4" /> Backend indisponível
            </span>
          )}
          {health.isSuccess && (
            <span className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="size-4" /> {health.data.service} · online
            </span>
          )}
        </CardContent>
      </Card>

      {/* Demo CRUD de notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas (demo)</CardTitle>
          <CardDescription>
            Entidade-exemplo persistida no SQLite via Prisma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota…"
              maxLength={200}
            />
            <Button type="submit" disabled={createNote.isPending}>
              {createNote.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Adicionar'
              )}
            </Button>
          </form>

          {notes.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando notas…</p>
          )}
          {notes.isError && (
            <p className="text-sm text-danger">Erro ao carregar notas.</p>
          )}
          {notes.isSuccess && notes.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma nota ainda. Crie a primeira acima.
            </p>
          )}
          {notes.isSuccess && notes.data.length > 0 && (
            <ul className="divide-y divide-border rounded-md border border-border">
              {notes.data.map((note) => (
                <li
                  key={note.id}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="truncate text-sm">{note.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${note.title}`}
                    onClick={() => deleteNote.mutate(note.id)}
                    disabled={deleteNote.isPending}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
