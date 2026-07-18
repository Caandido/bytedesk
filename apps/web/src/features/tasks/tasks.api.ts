import { apiFetch } from '@/services/api';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from '@devflow/shared';

/**
 * Service da feature Tarefas (Kanban), aninhada sob o projeto. Reusa `apiFetch`.
 * `move` retorna o quadro inteiro do projeto (posições já reindexadas pelo back).
 */
export const tasksApi = {
  list: (projectId: string) =>
    apiFetch<Task[]>(`/projects/${projectId}/tasks`),

  create: (projectId: string, input: CreateTaskInput) =>
    apiFetch<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (projectId: string, taskId: string, input: UpdateTaskInput) =>
    apiFetch<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  move: (projectId: string, taskId: string, input: MoveTaskInput) =>
    apiFetch<Task[]>(`/projects/${projectId}/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (projectId: string, taskId: string) =>
    apiFetch<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};
