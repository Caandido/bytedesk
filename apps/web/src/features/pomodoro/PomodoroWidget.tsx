import { useEffect, useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, Brain, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  usePomodoroStore,
  type PomodoroMode,
} from '@/stores/pomodoro';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const MODE_LABEL: Record<PomodoroMode, string> = {
  work: 'Foco',
  break: 'Pausa',
};

/**
 * Pomodoro do Topbar: mostra o tempo e abre um painel com controles. O `tick`
 * global é dirigido por um único setInterval aqui (o Topbar está sempre montado).
 */
export function PomodoroWidget() {
  const { mode, secondsLeft, running, completed, start, pause, reset, setMode, tick } =
    usePomodoroStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Driver do timer: 1 tick/s enquanto rodando.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  // Atualiza o título da aba com o tempo restante quando rodando.
  useEffect(() => {
    if (running) {
      document.title = `${fmt(secondsLeft)} · ${MODE_LABEL[mode]} — ByteDesk`;
    } else {
      document.title = 'ByteDesk';
    }
    return () => {
      document.title = 'ByteDesk';
    };
  }, [running, secondsLeft, mode]);

  // Fecha o painel ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pomodoro"
        className={cn(
          'flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent',
          running && mode === 'work' && 'border-primary/50 text-primary',
          running && mode === 'break' && 'border-info/50 text-info',
        )}
      >
        <Timer className="size-4" />
        <span className="tabular-nums font-medium">{fmt(secondsLeft)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl">
          <div className="mb-3 flex gap-1">
            {(['work', 'break'] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'work' ? (
                  <Brain className="size-3.5" />
                ) : (
                  <Coffee className="size-3.5" />
                )}
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <p className="mb-3 text-center text-4xl font-bold tabular-nums">
            {fmt(secondsLeft)}
          </p>

          <div className="flex items-center justify-center gap-2">
            {running ? (
              <Button variant="outline" size="sm" onClick={pause}>
                <Pause className="size-4" /> Pausar
              </Button>
            ) : (
              <Button size="sm" onClick={start}>
                <Play className="size-4" /> Iniciar
              </Button>
            )}
            <Button variant="outline" size="icon" aria-label="Reiniciar" onClick={reset}>
              <RotateCcw className="size-4" />
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {completed} pomodoro{completed === 1 ? '' : 's'} de foco concluído
            {completed === 1 ? '' : 's'} hoje
          </p>
        </div>
      )}
    </div>
  );
}
