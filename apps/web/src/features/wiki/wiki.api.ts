import { apiFetch } from '@/services/api';
import type {
  WikiPage,
  CreateWikiPageInput,
  UpdateWikiPageInput,
} from '@devflow/shared';

/** Service da feature Conhecimento (wiki). Reusa `apiFetch`. */
export const wikiApi = {
  list: () => apiFetch<WikiPage[]>('/wiki'),

  create: (input: CreateWikiPageInput) =>
    apiFetch<WikiPage>('/wiki', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateWikiPageInput) =>
    apiFetch<WikiPage>(`/wiki/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<WikiPage>(`/wiki/${id}`, { method: 'DELETE' }),
};
