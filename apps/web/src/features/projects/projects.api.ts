import { apiFetch } from '@/services/api';
import type {
  Project,
  StudyObjective,
  CreateProjectInput,
  UpdateProjectInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from '@devflow/shared';

/**
 * Service da feature Projetos. Reusa `apiFetch` e reflete as rotas do
 * ProjectsController. Os objetivos compartilham os contratos com Estudos.
 */
export const projectsApi = {
  list: () => apiFetch<Project[]>('/projects'),

  byId: (id: string) => apiFetch<Project>(`/projects/${id}`),

  create: (input: CreateProjectInput) =>
    apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateProjectInput) =>
    apiFetch<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<Project>(`/projects/${id}`, { method: 'DELETE' }),

  addObjective: (projectId: string, input: CreateObjectiveInput) =>
    apiFetch<StudyObjective>(`/projects/${projectId}/objectives`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateObjective: (
    projectId: string,
    objectiveId: string,
    input: UpdateObjectiveInput,
  ) =>
    apiFetch<StudyObjective>(
      `/projects/${projectId}/objectives/${objectiveId}`,
      { method: 'PATCH', body: JSON.stringify(input) },
    ),

  removeObjective: (projectId: string, objectiveId: string) =>
    apiFetch<StudyObjective>(
      `/projects/${projectId}/objectives/${objectiveId}`,
      { method: 'DELETE' },
    ),
};
