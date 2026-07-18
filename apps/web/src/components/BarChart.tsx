import type { StatSlice } from '@devflow/shared';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: StatSlice[];
  /** Classe de cor da barra (ex.: 'bg-primary'). */
  barClass?: string;
  emptyLabel?: string;
}

/**
 * Gráfico de barras horizontais leve (SVG/CSS, sem lib). Cada barra é escalada
 * pelo maior valor da série. Acessível: os valores aparecem como texto.
 */
export function BarChart({
  data,
  barClass = 'bg-primary',
  emptyLabel = 'Sem dados ainda.',
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return <p className="py-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((slice) => (
        <div key={slice.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs text-muted-foreground">
            {slice.label}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
            <div
              className={cn('h-full rounded transition-all', barClass)}
              style={{ width: `${(slice.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
            {slice.value}
          </span>
        </div>
      ))}
    </div>
  );
}
