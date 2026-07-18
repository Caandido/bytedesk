import { apiFetch } from '@/services/api';
import type { Bug, CreateBugInput, UpdateBugInput } from '@devflow/shared';

/** Service da feature Bugs (aninhada sob o projeto). Reusa `apiFetch`. */
export const bugsApi = {
  list: (projectId: string) => apiFetch<Bug[]>(`/projects/${projectId}/bugs`),

  create: (projectId: string, input: CreateBugInput) =>
    apiFetch<Bug>(`/projects/${projectId}/bugs`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (projectId: string, bugId: string, input: UpdateBugInput) =>
    apiFetch<Bug>(`/projects/${projectId}/bugs/${bugId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (projectId: string, bugId: string) =>
    apiFetch<Bug>(`/projects/${projectId}/bugs/${bugId}`, { method: 'DELETE' }),
};
