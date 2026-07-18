import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from '@devflow/shared';
import { tasksApi } from './tasks.api';

/** Chaves de cache da feature Tarefas (por projeto). */
export const tasksKeys = {
  list: (projectId: string) => ['projects', projectId, 'tasks'] as const,
};

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: tasksKeys.list(projectId),
    queryFn: () => tasksApi.list(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(projectId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: tasksKeys.list(projectId) }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      tasksApi.update(projectId, taskId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: tasksKeys.list(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId, taskId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: tasksKeys.list(projectId) }),
  });
}

/**
 * Move uma tarefa no Kanban. O backend retorna o quadro inteiro com as posições
 * reindexadas — gravamos direto no cache (sem refetch) para o board ficar coerente.
 */
export function useMoveTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: MoveTaskInput }) =>
      tasksApi.move(projectId, taskId, input),
    onSuccess: (board: Task[]) =>
      qc.setQueryData(tasksKeys.list(projectId), board),
    onError: () =>
      // Em caso de erro, ressincroniza com o servidor.
      qc.invalidateQueries({ queryKey: tasksKeys.list(projectId) }),
  });
}
