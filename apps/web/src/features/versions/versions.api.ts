import { apiFetch } from '@/services/api';
import type {
  ProjectVersion,
  CreateVersionInput,
  UpdateVersionInput,
} from '@devflow/shared';

/** Service da feature Versionamento (aninhada sob o projeto). */
export const versionsApi = {
  list: (projectId: string) =>
    apiFetch<ProjectVersion[]>(`/projects/${projectId}/versions`),

  create: (projectId: string, input: CreateVersionInput) =>
    apiFetch<ProjectVersion>(`/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (projectId: string, versionId: string, input: UpdateVersionInput) =>
    apiFetch<ProjectVersion>(`/projects/${projectId}/versions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (projectId: string, versionId: string) =>
    apiFetch<ProjectVersion>(`/projects/${projectId}/versions/${versionId}`, {
      method: 'DELETE',
    }),
};
