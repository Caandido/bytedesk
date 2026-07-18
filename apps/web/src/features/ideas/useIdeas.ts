import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateIdeaInput, UpdateIdeaInput } from '@devflow/shared';
import { ideasApi } from './ideas.api';

/** Chaves de cache da feature Banco de Ideias (por projeto). */
export const ideasKeys = {
  list: (projectId: string) => ['projects', projectId, 'ideas'] as const,
};

export function useIdeas(projectId: string) {
  return useQuery({
    queryKey: ideasKeys.list(projectId),
    queryFn: () => ideasApi.list(projectId),
  });
}

export function useCreateIdea(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIdeaInput) => ideasApi.create(projectId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ideasKeys.list(projectId) }),
  });
}

export function useUpdateIdea(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ideaId, input }: { ideaId: string; input: UpdateIdeaInput }) =>
      ideasApi.update(projectId, ideaId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ideasKeys.list(projectId) }),
  });
}

export function useDeleteIdea(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ideaId: string) => ideasApi.remove(projectId, ideaId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ideasKeys.list(projectId) }),
  });
}
