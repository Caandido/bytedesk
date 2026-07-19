import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

/**
 * Persiste o cache do TanStack Query no IndexedDB (via idb-keyval), permitindo
 * **ler os dados offline**: ao abrir o app sem internet, o que já foi carregado
 * (estudos, códigos, projetos, roadmaps…) é reidratado e exibido.
 */
const CACHE_KEY = 'bytedesk-query-cache';

export const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_KEY,
  throttleTime: 1000,
});

/** Apaga o cache persistido — usado no logout (evita vazar dados entre contas). */
export async function clearPersistedCache(): Promise<void> {
  try {
    await del(CACHE_KEY);
  } catch {
    /* IndexedDB indisponível — ignora. */
  }
}
