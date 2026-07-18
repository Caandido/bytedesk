import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateWikiPageInput, UpdateWikiPageInput } from '@devflow/shared';
import { wikiApi } from './wiki.api';

/** Chaves de cache da feature Conhecimento. */
export const wikiKeys = {
  all: ['wiki'] as const,
};

export function useWikiPages() {
  return useQuery({ queryKey: wikiKeys.all, queryFn: wikiApi.list });
}

export function useCreateWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWikiPageInput) => wikiApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: wikiKeys.all }),
  });
}

export function useUpdateWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWikiPageInput }) =>
      wikiApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: wikiKeys.all }),
  });
}

export function useDeleteWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wikiApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: wikiKeys.all }),
  });
}
