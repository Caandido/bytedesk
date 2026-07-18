import { createZodDto } from 'nestjs-zod';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from '@devflow/shared';

/**
 * DTOs do sub-módulo Tarefas derivados dos schemas Zod compartilhados.
 * `MoveTaskDto` carrega a coluna de destino + posição para o Kanban.
 */
export class CreateTaskDto extends createZodDto(createTaskSchema) {}
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
export class MoveTaskDto extends createZodDto(moveTaskSchema) {}
