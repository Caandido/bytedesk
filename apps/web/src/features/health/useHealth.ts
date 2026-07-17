import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';

interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

/** Consulta o endpoint /api/health para provar a conexão com o backend. */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthResponse>('/health'),
    retry: false,
    staleTime: 30_000,
  });
}
