import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  ProjectArchitecture,
  UpdateArchitectureInput,
} from '@devflow/shared';
import { apiFetch } from '@/services/api';

const key = (projectId: string) =>
  ['projects', projectId, 'architecture'] as const;

/** Arquitetura do projeto (registro 1-1; GET traz defaults vazios se não salva). */
export function useArchitecture(projectId: string) {
  return useQuery({
    queryKey: key(projectId),
    queryFn: () =>
      apiFetch<ProjectArchitecture>(`/projects/${projectId}/architecture`),
  });
}

export function useSaveArchitecture(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateArchitectureInput) =>
      apiFetch<ProjectArchitecture>(`/projects/${projectId}/architecture`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => qc.setQueryData(key(projectId), data),
  });
}
