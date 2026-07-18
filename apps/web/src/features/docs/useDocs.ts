import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateDocInput, UpdateDocInput } from '@devflow/shared';
import { docsApi } from './docs.api';

/** Chaves de cache da feature Documentação (por projeto). */
export const docsKeys = {
  list: (projectId: string) => ['projects', projectId, 'docs'] as const,
};

export function useDocs(projectId: string) {
  return useQuery({
    queryKey: docsKeys.list(projectId),
    queryFn: () => docsApi.list(projectId),
  });
}

export function useCreateDoc(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocInput) => docsApi.create(projectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: docsKeys.list(projectId) }),
  });
}

export function useUpdateDoc(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, input }: { docId: string; input: UpdateDocInput }) =>
      docsApi.update(projectId, docId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: docsKeys.list(projectId) }),
  });
}

export function useDeleteDoc(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => docsApi.remove(projectId, docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: docsKeys.list(projectId) }),
  });
}
