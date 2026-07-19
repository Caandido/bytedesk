import { apiFetch } from '@/services/api';
import type {
  Study,
  StudyObjective,
  StudySection,
  StudyCodeFile,
  CreateStudyInput,
  UpdateStudyInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateCodeFileInput,
  UpdateCodeFileInput,
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

  addSection: (studyId: string, input: CreateSectionInput) =>
    apiFetch<StudySection>(`/studies/${studyId}/sections`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateSection: (
    studyId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ) =>
    apiFetch<StudySection>(`/studies/${studyId}/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  removeSection: (studyId: string, sectionId: string) =>
    apiFetch<StudySection>(`/studies/${studyId}/sections/${sectionId}`, {
      method: 'DELETE',
    }),

  addCodeFile: (studyId: string, input: CreateCodeFileInput) =>
    apiFetch<StudyCodeFile>(`/studies/${studyId}/code`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateCodeFile: (
    studyId: string,
    fileId: string,
    input: UpdateCodeFileInput,
  ) =>
    apiFetch<StudyCodeFile>(`/studies/${studyId}/code/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  removeCodeFile: (studyId: string, fileId: string) =>
    apiFetch<StudyCodeFile>(`/studies/${studyId}/code/${fileId}`, {
      method: 'DELETE',
    }),

  linkProject: (studyId: string, projectId: string) =>
    apiFetch<Study>(`/studies/${studyId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  unlinkProject: (studyId: string, projectId: string) =>
    apiFetch<Study>(`/studies/${studyId}/projects/${projectId}`, {
      method: 'DELETE',
    }),
};
