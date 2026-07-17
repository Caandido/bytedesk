import { apiFetch } from '@/services/api';
import type { CreateNoteInput, Note } from '@devflow/shared';

/**
 * Service da entidade-exemplo `Note`. Referência do padrão de service por feature:
 * cada módulo real terá seu próprio arquivo `<modulo>.api.ts` reusando `apiFetch`.
 */
export const notesApi = {
  list: () => apiFetch<Note[]>('/notes'),
  create: (input: CreateNoteInput) =>
    apiFetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    apiFetch<Note>(`/notes/${id}`, { method: 'DELETE' }),
};
