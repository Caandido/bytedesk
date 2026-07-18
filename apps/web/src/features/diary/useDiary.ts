import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from '@devflow/shared';
import { diaryApi } from './diary.api';

/** Chaves de cache da feature Diário. */
export const diaryKeys = {
  all: ['diary'] as const,
};

export function useDiary() {
  return useQuery({ queryKey: diaryKeys.all, queryFn: diaryApi.list });
}

export function useCreateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDiaryEntryInput) => diaryApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}

export function useUpdateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDiaryEntryInput }) =>
      diaryApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => diaryApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}
