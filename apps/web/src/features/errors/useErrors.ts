import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateKnownErrorInput,
  UpdateKnownErrorInput,
} from '@devflow/shared';
import { errorsApi } from './errors.api';

/** Chaves de cache da feature Banco de Erros. */
export const errorsKeys = {
  all: ['errors'] as const,
};

export function useKnownErrors() {
  return useQuery({ queryKey: errorsKeys.all, queryFn: errorsApi.list });
}

export function useCreateKnownError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateKnownErrorInput) => errorsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: errorsKeys.all }),
  });
}

export function useUpdateKnownError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateKnownErrorInput }) =>
      errorsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: errorsKeys.all }),
  });
}

export function useDeleteKnownError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => errorsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: errorsKeys.all }),
  });
}
