import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { SearchResponse } from '@devflow/shared';
import { apiFetch } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Busca global no servidor. Faz debounce do termo e só consulta com 2+ caracteres.
 * `keepPreviousData` evita piscar a lista enquanto o próximo resultado carrega.
 */
export function useSearch(query: string) {
  const debounced = useDebounce(query.trim(), 250);
  const enabled = debounced.length >= 2;

  const result = useQuery({
    queryKey: ['search', debounced],
    queryFn: () =>
      apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(debounced)}`),
    enabled,
    placeholderData: keepPreviousData,
  });

  return { ...result, enabled, term: debounced };
}
