import { apiFetch } from '@/services/api';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@devflow/shared';

/** Service da feature Banco de Ideias (aninhada sob o projeto). */
export const ideasApi = {
  list: (projectId: string) =>
    apiFetch<Idea[]>(`/projects/${projectId}/ideas`),

  create: (projectId: string, input: CreateIdeaInput) =>
    apiFetch<Idea>(`/projects/${projectId}/ideas`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (projectId: string, ideaId: string, input: UpdateIdeaInput) =>
    apiFetch<Idea>(`/projects/${projectId}/ideas/${ideaId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (projectId: string, ideaId: string) =>
    apiFetch<Idea>(`/projects/${projectId}/ideas/${ideaId}`, {
      method: 'DELETE',
    }),
};
