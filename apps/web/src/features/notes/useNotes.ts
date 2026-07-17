import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateNoteInput } from '@devflow/shared';
import { notesApi } from './notes.api';

const NOTES_KEY = ['notes'] as const;

/** Hooks TanStack Query da feature Notes — padrão para os módulos futuros. */
export function useNotes() {
  return useQuery({ queryKey: NOTES_KEY, queryFn: notesApi.list });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}
