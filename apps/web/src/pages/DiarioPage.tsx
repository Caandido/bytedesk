import { useState } from 'react';
import { Plus, Clock, Loader2, NotebookPen, Gauge } from 'lucide-react';
import { moodEmoji, type DiaryEntry } from '@devflow/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiaryDialog } from '@/features/diary/DiaryDialog';
import { useDiary } from '@/features/diary/useDiary';

/** Formata minutos como "1h30" / "45min". */
function formatTime(min: number): string {
  if (min <= 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h${String(m).padStart(2, '0')}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

/** Diário de Desenvolvimento: timeline de registros de sessões. */
export function DiarioPage() {
  const diary = useDiary();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (entry: DiaryEntry) => {
    setEditing(entry);
    setDialogOpen(true);
  };

  const entries = diary.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Diário de Desenvolvimento
          </h1>
          <p className="text-muted-foreground">
            Registre o que foi feito, problemas e próximos passos de cada sessão.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" /> Novo registro
        </Button>
      </div>

      {diary.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      )}
      {diary.isError && (
        <p className="text-sm text-danger">Erro ao carregar o diário.</p>
      )}

      {diary.isSuccess && entries.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <NotebookPen className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Nenhum registro ainda. Comece o diário da sua sessão de hoje.
            </p>
            <Button onClick={openNew}>
              <Plus className="size-4" /> Novo registro
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} onClick={() => openEdit(entry)} />
        ))}
      </div>

      <DiaryDialog
        open={dialogOpen}
        entry={editing}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

function DiaryCard({
  entry,
  onClick,
}: {
  entry: DiaryEntry;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold">
            {new Date(entry.date).toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            })}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" /> {formatTime(entry.minutesSpent)}
          </span>
          <span
            className="text-base"
            title={`Humor ${entry.mood}/5`}
            aria-label={`Humor ${entry.mood} de 5`}
          >
            {moodEmoji(entry.mood)}
          </span>
          <span
            className="flex items-center gap-1 text-muted-foreground"
            title={`Produtividade ${entry.productivity}/5`}
          >
            <Gauge className="size-3.5" /> {entry.productivity}/5
          </span>
          {entry.projectName && (
            <Badge variant="outline">{entry.projectName}</Badge>
          )}
        </div>

        {entry.done && (
          <p className="whitespace-pre-wrap text-sm">{entry.done}</p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {entry.problems && (
            <Field label="Problemas" text={entry.problems} tone="danger" />
          )}
          {entry.solutions && (
            <Field label="Solução" text={entry.solutions} tone="primary" />
          )}
        </div>

        {entry.nextSteps && (
          <Field label="Próximos passos" text={entry.nextSteps} />
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone?: 'danger' | 'primary';
}) {
  const color =
    tone === 'danger'
      ? 'text-danger'
      : tone === 'primary'
        ? 'text-primary'
        : 'text-muted-foreground';
  return (
    <div className="text-xs">
      <span className={`font-medium ${color}`}>{label}: </span>
      <span className="whitespace-pre-wrap text-muted-foreground">{text}</span>
    </div>
  );
}
