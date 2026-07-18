import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
} from '@devflow/shared';
import { projectsApi } from './projects.api';

/** Chaves de cache da feature Projetos. */
export const projectsKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectsKeys.all, queryFn: projectsApi.list });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectsKeys.detail(id ?? ''),
    queryFn: () => projectsApi.byId(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKeys.all });
      qc.invalidateQueries({ queryKey: projectsKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}

// ─── Objetivos ───────────────────────────────────────────────────────────────

export function useAddProjectObjective(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateObjectiveInput) =>
      projectsApi.addObjective(projectId, input),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useUpdateProjectObjective(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
      input,
    }: {
      objectiveId: string;
      input: UpdateObjectiveInput;
    }) => projectsApi.updateObjective(projectId, objectiveId, input),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useDeleteProjectObjective(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (objectiveId: string) =>
      projectsApi.removeObjective(projectId, objectiveId),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

function invalidateProject(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  qc.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
  qc.invalidateQueries({ queryKey: projectsKeys.all });
}
