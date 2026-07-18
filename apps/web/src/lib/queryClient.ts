import { QueryClient } from '@tanstack/react-query';

/**
 * Instância única do QueryClient em nível de módulo, para poder ser usada fora do
 * React — ex.: limpar o cache ao trocar de workspace ou no logout (401).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});
