import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateStudyInput,
  UpdateStudyInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from '@devflow/shared';
import { studiesApi } from './studies.api';

/** Chaves de cache da feature Estudos. */
export const studiesKeys = {
  all: ['studies'] as const,
  detail: (id: string) => ['studies', id] as const,
};

/** Lista todos os estudos. */
export function useStudies() {
  return useQuery({ queryKey: studiesKeys.all, queryFn: studiesApi.list });
}

/** Carrega um estudo pelo id (com objetivos). */
export function useStudy(id: string | undefined) {
  return useQuery({
    queryKey: studiesKeys.detail(id ?? ''),
    queryFn: () => studiesApi.byId(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudyInput) => studiesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: studiesKeys.all }),
  });
}

export function useUpdateStudy(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStudyInput) => studiesApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studiesKeys.all });
      qc.invalidateQueries({ queryKey: studiesKeys.detail(id) });
    },
  });
}

export function useDeleteStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studiesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: studiesKeys.all }),
  });
}

// ─── Objetivos ───────────────────────────────────────────────────────────────
// Após cada mutação de objetivo, invalidamos o detalhe (recarrega a checklist) e a
// lista (atualiza o contador de progresso).

export function useAddObjective(studyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateObjectiveInput) =>
      studiesApi.addObjective(studyId, input),
    onSuccess: () => invalidateStudy(qc, studyId),
  });
}

export function useUpdateObjective(studyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
      input,
    }: {
      objectiveId: string;
      input: UpdateObjectiveInput;
    }) => studiesApi.updateObjective(studyId, objectiveId, input),
    onSuccess: () => invalidateStudy(qc, studyId),
  });
}

export function useDeleteObjective(studyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (objectiveId: string) =>
      studiesApi.removeObjective(studyId, objectiveId),
    onSuccess: () => invalidateStudy(qc, studyId),
  });
}

function invalidateStudy(
  qc: ReturnType<typeof useQueryClient>,
  studyId: string,
) {
  qc.invalidateQueries({ queryKey: studiesKeys.detail(studyId) });
  qc.invalidateQueries({ queryKey: studiesKeys.all });
}
