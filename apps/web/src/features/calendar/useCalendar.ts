import { useQuery } from '@tanstack/react-query';
import type { CalendarEvent } from '@devflow/shared';
import { apiFetch } from '@/services/api';

/** Eventos datados agregados (`GET /api/calendar`). */
export function useCalendar() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: () => apiFetch<CalendarEvent[]>('/calendar'),
  });
}
