import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  CALENDAR_EVENT_META,
  type CalendarEvent,
  type CalendarEventType,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCalendar } from '@/features/calendar/useCalendar';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Calendário mensal com eventos agregados (prazos, versões, diário, etc.). */
export function CalendarioPage() {
  const calendar = useCalendar();
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of calendar.data ?? []) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [calendar.data]);

  // Monta a grade (semanas começando no domingo).
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const result: { day: number | null; date?: string }[] = [];
    for (let i = 0; i < startWeekday; i++) result.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, date: iso(view.year, view.month, d) });
    }
    while (result.length % 7 !== 0) result.push({ day: null });
    return result;
  }, [view]);

  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());

  const move = (delta: number) => {
    const m = view.month + delta;
    setView({
      year: view.year + Math.floor(m / 12),
      month: ((m % 12) + 12) % 12,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Prazos, versões, início de projetos/estudos e registros do diário.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => move(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-40 text-center text-sm font-medium">
            {MONTHS[view.month]} {view.year}
          </span>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => move(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {calendar.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      )}

      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="pb-1 text-center text-xs font-medium text-muted-foreground"
              >
                {w}
              </div>
            ))}
            {cells.map((cell, i) => {
              const events = cell.date ? eventsByDay.get(cell.date) ?? [] : [];
              const isToday = cell.date === todayIso;
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-20 rounded-md border p-1.5',
                    cell.day
                      ? 'border-border'
                      : 'border-transparent bg-transparent',
                    isToday && 'border-primary/60 bg-primary/5',
                  )}
                >
                  {cell.day && (
                    <>
                      <span
                        className={cn(
                          'text-xs',
                          isToday
                            ? 'font-bold text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        {cell.day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {events.slice(0, 3).map((e, ei) => (
                          <Link
                            key={ei}
                            to={e.url}
                            title={`${CALENDAR_EVENT_META[e.type].label}: ${e.title}`}
                            className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-accent"
                          >
                            <span
                              className={cn(
                                'size-1.5 shrink-0 rounded-full',
                                CALENDAR_EVENT_META[e.type].color,
                              )}
                            />
                            <span className="truncate">{e.title}</span>
                          </Link>
                        ))}
                        {events.length > 3 && (
                          <span className="px-1 text-[10px] text-muted-foreground">
                            +{events.length - 3}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {(Object.keys(CALENDAR_EVENT_META) as CalendarEventType[]).map((type) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('size-2 rounded-full', CALENDAR_EVENT_META[type].color)} />
            {CALENDAR_EVENT_META[type].label}
          </span>
        ))}
      </div>
    </div>
  );
}
