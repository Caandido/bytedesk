import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do sub-módulo **Tarefas** (Kanban) de um projeto. Segue o padrão dos
 * demais módulos. O `status` corresponde à coluna do quadro; `position` é a ordem
 * dentro da coluna.
 */

/** Coluna do Kanban — espelha o enum `TaskStatus` do Prisma. */
export const taskStatusSchema = z.enum([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'TESTING',
  'DONE',
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

/** Prioridade — espelha o enum `TaskPriority` do Prisma. */
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

/** Payload para criar uma tarefa. Só `title` é obrigatório. */
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  description: z.string().max(10_000).optional().default(''),
  status: taskStatusSchema.optional().default('BACKLOG'),
  priority: taskPrioritySchema.optional().default('MEDIUM'),
  assignee: z.string().trim().max(120).optional().default(''),
  estimatedHours: z.number().min(0).max(100_000).optional().default(0),
  spentHours: z.number().min(0).max(100_000).optional().default(0),
});

/**
 * Payload para atualizar campos editáveis de uma tarefa (todos opcionais). Não
 * inclui `status`: mudança de coluna acontece pelo endpoint `/move`, que reindexa
 * as posições para manter a ordem do Kanban consistente.
 */
export const updateTaskSchema = createTaskSchema.omit({ status: true }).partial();

/**
 * Payload para mover uma tarefa no Kanban: coluna de destino + índice (posição)
 * dentro dela. O backend reindexa as posições da(s) coluna(s) afetada(s).
 */
export const moveTaskSchema = z.object({
  status: taskStatusSchema,
  position: z.number().int().min(0),
});

/** Entidade completa de tarefa retornada pela API. */
export const taskSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    title: z.string(),
    description: z.string(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    assignee: z.string(),
    estimatedHours: z.number(),
    spentHours: z.number(),
    position: z.number().int(),
  })
  .merge(timestampsSchema);

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type MoveTaskInput = z.input<typeof moveTaskSchema>;
export type Task = z.infer<typeof taskSchema>;

/** Colunas do Kanban, na ordem de exibição. */
export const TASK_STATUS_ORDER: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'TESTING',
  'DONE',
];

/** Rótulos legíveis (pt-BR). */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Desenvolvimento',
  TESTING: 'Em Testes',
  DONE: 'Concluído',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
