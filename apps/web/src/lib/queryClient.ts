import { QueryClient } from '@tanstack/react-query';

/**
 * Instância única do QueryClient em nível de módulo, para poder ser usada fora do
 * React — ex.: limpar o cache ao trocar de workspace ou no logout (401).
 *
 * `gcTime` alto (7 dias) mantém os dados em cache tempo suficiente para serem
 * persistidos no IndexedDB e reidratados offline (ver lib/persister.ts).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});
