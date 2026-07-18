import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateVersionInput, UpdateVersionInput } from '@devflow/shared';
import { versionsApi } from './versions.api';

/** Chaves de cache da feature Versionamento (por projeto). */
export const versionsKeys = {
  list: (projectId: string) => ['projects', projectId, 'versions'] as const,
};

export function useVersions(projectId: string) {
  return useQuery({
    queryKey: versionsKeys.list(projectId),
    queryFn: () => versionsApi.list(projectId),
  });
}

export function useCreateVersion(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVersionInput) =>
      versionsApi.create(projectId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: versionsKeys.list(projectId) }),
  });
}

export function useUpdateVersion(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      versionId,
      input,
    }: {
      versionId: string;
      input: UpdateVersionInput;
    }) => versionsApi.update(projectId, versionId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: versionsKeys.list(projectId) }),
  });
}

export function useDeleteVersion(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => versionsApi.remove(projectId, versionId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: versionsKeys.list(projectId) }),
  });
}
