import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import type { ActivityDay } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];
const WEEKS = 53;

/** Chave de dia (YYYY-MM-DD) no calendário local, alinhada com o backend. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Classe de cor por intensidade (P&B: primary com opacidade crescente). */
function levelClass(count: number): string {
  if (count <= 0) return 'bg-muted';
  if (count <= 1) return 'bg-primary/25';
  if (count <= 3) return 'bg-primary/45';
  if (count <= 6) return 'bg-primary/70';
  return 'bg-primary';
}

interface Cell {
  key: string;
  date: Date;
  count: number;
  future: boolean;
}

interface HeatmapModel {
  weeks: Cell[][];
  monthLabels: { col: number; label: string }[];
  total: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
}

/** Constrói a grade de 53 semanas (colunas) × 7 dias, terminando na semana atual. */
function buildModel(activity: ActivityDay[]): HeatmapModel {
  const counts = new Map(activity.map((a) => [a.date, a.count]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Domingo da semana atual → recua (WEEKS-1) semanas para o início da grade.
  const startSunday = addDays(today, -today.getDay() - (WEEKS - 1) * 7);

  const weeks: Cell[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  let total = 0;
  let activeDays = 0;
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(startSunday, w * 7 + d);
      const key = dayKey(date);
      const future = date > today;
      const count = future ? 0 : counts.get(key) ?? 0;
      if (!future && count > 0) {
        total += count;
        activeDays += 1;
      }
      col.push({ key, date, count, future });
    }
    // Rótulo do mês na primeira semana em que ele aparece.
    const firstOfCol = col[0].date;
    if (firstOfCol.getMonth() !== lastMonth) {
      lastMonth = firstOfCol.getMonth();
      monthLabels.push({ col: w, label: MONTHS[lastMonth] });
    }
    weeks.push(col);
  }

  // Streaks (sequências de dias consecutivos com atividade).
  let currentStreak = 0;
  let cursor = counts.get(dayKey(today)) ? today : addDays(today, -1);
  while ((counts.get(dayKey(cursor)) ?? 0) > 0) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }
  let longestStreak = 0;
  let run = 0;
  for (let i = (WEEKS - 1) * 7 + today.getDay(); i >= 0; i--) {
    const date = addDays(startSunday, i);
    if ((counts.get(dayKey(date)) ?? 0) > 0) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  return { weeks, monthLabels, total, currentStreak, longestStreak, activeDays };
}

/**
 * Mapa de frequência de atividade estilo GitHub (P&B): 53 semanas × 7 dias, com
 * intensidade por número de eventos, streaks e legenda. Alimentado por
 * `dashboard.activity` (criações dos módulos + entradas do diário).
 */
export function ActivityHeatmap({ activity }: { activity: ActivityDay[] }) {
  const model = useMemo(() => buildModel(activity), [activity]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Frequência de atividade</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {model.total} {model.total === 1 ? 'evento' : 'eventos'} em{' '}
            {model.activeDays} {model.activeDays === 1 ? 'dia' : 'dias'} · último ano
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="flex items-center justify-end gap-1 text-lg font-bold tabular-nums">
              <Flame className="size-4 text-primary" />
              {model.currentStreak}
            </p>
            <p className="text-[11px] text-muted-foreground">sequência atual</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{model.longestStreak}</p>
            <p className="text-[11px] text-muted-foreground">recorde</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1">
            {/* Rótulos de mês */}
            <div className="flex gap-[3px] pl-7 text-[10px] text-muted-foreground">
              {model.weeks.map((_, w) => {
                const label = model.monthLabels.find((m) => m.col === w);
                return (
                  <div key={w} className="w-3 shrink-0">
                    {label ? <span>{label.label}</span> : null}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[3px]">
              {/* Rótulos de dia da semana */}
              <div className="mr-1 flex w-6 shrink-0 flex-col gap-[3px] text-[10px] text-muted-foreground">
                {['', 'seg', '', 'qua', '', 'sex', ''].map((label, i) => (
                  <div key={i} className="flex h-3 items-center">
                    {label}
                  </div>
                ))}
              </div>

              {/* Colunas (semanas) */}
              {model.weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((cell) =>
                    cell.future ? (
                      <div key={cell.key} className="size-3" />
                    ) : (
                      <div
                        key={cell.key}
                        title={`${cell.count} ${cell.count === 1 ? 'evento' : 'eventos'} · ${cell.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                        className={`size-3 rounded-sm ${levelClass(cell.count)} ring-1 ring-inset ring-border/40 transition-colors`}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Menos</span>
          {[0, 1, 3, 6, 10].map((c) => (
            <span
              key={c}
              className={`size-3 rounded-sm ${levelClass(c)} ring-1 ring-inset ring-border/40`}
            />
          ))}
          <span>Mais</span>
        </div>
      </CardContent>
    </Card>
  );
}
