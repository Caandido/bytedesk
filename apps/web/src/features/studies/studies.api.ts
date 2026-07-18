import { apiFetch } from '@/services/api';
import type {
  Study,
  StudyObjective,
  CreateStudyInput,
  UpdateStudyInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from '@devflow/shared';

/**
 * Service da feature Estudos. Reusa `apiFetch` e reflete as rotas do
 * StudiesController. Segue o padrão de `features/notes/notes.api.ts`.
 */
export const studiesApi = {
  list: () => apiFetch<Study[]>('/studies'),

  byId: (id: string) => apiFetch<Study>(`/studies/${id}`),

  create: (input: CreateStudyInput) =>
    apiFetch<Study>('/studies', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateStudyInput) =>
    apiFetch<Study>(`/studies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<Study>(`/studies/${id}`, { method: 'DELETE' }),

  addObjective: (studyId: string, input: CreateObjectiveInput) =>
    apiFetch<StudyObjective>(`/studies/${studyId}/objectives`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateObjective: (
    studyId: string,
    objectiveId: string,
    input: UpdateObjectiveInput,
  ) =>
    apiFetch<StudyObjective>(`/studies/${studyId}/objectives/${objectiveId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  removeObjective: (studyId: string, objectiveId: string) =>
    apiFetch<StudyObjective>(
      `/studies/${studyId}/objectives/${objectiveId}`,
      { method: 'DELETE' },
    ),
};
