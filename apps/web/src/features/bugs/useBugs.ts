import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateBugInput, UpdateBugInput } from '@devflow/shared';
import { bugsApi } from './bugs.api';

/** Chaves de cache da feature Bugs (por projeto). */
export const bugsKeys = {
  list: (projectId: string) => ['projects', projectId, 'bugs'] as const,
};

export function useBugs(projectId: string) {
  return useQuery({
    queryKey: bugsKeys.list(projectId),
    queryFn: () => bugsApi.list(projectId),
  });
}

export function useCreateBug(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBugInput) => bugsApi.create(projectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: bugsKeys.list(projectId) }),
  });
}

export function useUpdateBug(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bugId, input }: { bugId: string; input: UpdateBugInput }) =>
      bugsApi.update(projectId, bugId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: bugsKeys.list(projectId) }),
  });
}

export function useDeleteBug(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bugId: string) => bugsApi.remove(projectId, bugId),
    onSuccess: () => qc.invalidateQueries({ queryKey: bugsKeys.list(projectId) }),
  });
}
