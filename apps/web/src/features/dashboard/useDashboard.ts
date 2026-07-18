import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '@devflow/shared';
import { apiFetch } from '@/services/api';

/** Dados agregados da tela inicial (`GET /api/dashboard`). */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardData>('/dashboard'),
  });
}
