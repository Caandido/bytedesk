import { type ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '@/lib/queryClient';
import { persister } from '@/lib/persister';

/**
 * Providers globais. O `PersistQueryClientProvider` reidrata o cache do IndexedDB
 * na inicialização — então o app mostra os últimos dados carregados mesmo offline.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
