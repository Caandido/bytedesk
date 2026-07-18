import { apiFetch } from '@/services/api';
import type { ProjectDoc, CreateDocInput, UpdateDocInput } from '@devflow/shared';

/** Service da feature Documentação (aninhada sob o projeto). */
export const docsApi = {
  list: (projectId: string) =>
    apiFetch<ProjectDoc[]>(`/projects/${projectId}/docs`),

  create: (projectId: string, input: CreateDocInput) =>
    apiFetch<ProjectDoc>(`/projects/${projectId}/docs`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (projectId: string, docId: string, input: UpdateDocInput) =>
    apiFetch<ProjectDoc>(`/projects/${projectId}/docs/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (projectId: string, docId: string) =>
    apiFetch<ProjectDoc>(`/projects/${projectId}/docs/${docId}`, {
      method: 'DELETE',
    }),
};
