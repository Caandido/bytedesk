import { useQuery } from '@tanstack/react-query';
import type { Stats } from '@devflow/shared';
import { apiFetch } from '@/services/api';

/** Métricas agregadas (`GET /api/stats`). */
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch<Stats>('/stats'),
  });
}
