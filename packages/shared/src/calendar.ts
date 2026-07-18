import { z } from 'zod';
import { idSchema } from './common';

/**
 * Contrato do **Calendário** — eventos datados agregados de vários módulos
 * (prazos de projeto, início/lançamento, registros de diário).
 */

export const calendarEventTypeSchema = z.enum([
  'project-deadline',
  'project-start',
  'study-start',
  'version',
  'diary',
]);
export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>;

export const calendarEventSchema = z.object({
  type: calendarEventTypeSchema,
  /** Data no formato YYYY-MM-DD (UTC). */
  date: z.string(),
  title: z.string(),
  /** Rota no app para o item de origem. */
  url: z.string(),
  entityId: idSchema,
});
export type CalendarEvent = z.infer<typeof calendarEventSchema>;

/** Rótulos e cores (classe de token) por tipo de evento. */
export const CALENDAR_EVENT_META: Record<
  CalendarEventType,
  { label: string; color: string }
> = {
  'project-deadline': { label: 'Prazo', color: 'bg-danger' },
  'project-start': { label: 'Início projeto', color: 'bg-info' },
  'study-start': { label: 'Início estudo', color: 'bg-primary' },
  version: { label: 'Versão', color: 'bg-warning' },
  diary: { label: 'Diário', color: 'bg-muted-foreground' },
};
