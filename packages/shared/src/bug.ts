import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do sub-módulo **Bugs** de um projeto. Segue o padrão dos demais módulos.
 */

/** Gravidade — espelha o enum `BugSeverity` do Prisma. */
export const bugSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type BugSeverity = z.infer<typeof bugSeveritySchema>;

/** Prioridade — espelha o enum `BugPriority` do Prisma. */
export const bugPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type BugPriority = z.infer<typeof bugPrioritySchema>;

/** Situação — espelha o enum `BugStatus` do Prisma. */
export const bugStatusSchema = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'WONT_FIX',
]);
export type BugStatus = z.infer<typeof bugStatusSchema>;

const longText = z.string().max(20_000).optional().default('');
const shortText = z.string().trim().max(160).optional().default('');

/** Payload para criar um bug. Só `title` é obrigatório. */
export const createBugSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  description: longText,
  severity: bugSeveritySchema.optional().default('MEDIUM'),
  priority: bugPrioritySchema.optional().default('MEDIUM'),
  status: bugStatusSchema.optional().default('OPEN'),
  version: shortText,
  module: shortText,
  stepsToReproduce: longText,
  expectedResult: longText,
  actualResult: longText,
  logs: longText,
  fix: longText,
  fixedBy: shortText,
});

/** Payload para atualizar um bug (todos os campos opcionais). */
export const updateBugSchema = createBugSchema.partial();

/** Entidade completa de bug retornada pela API. */
export const bugSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    title: z.string(),
    description: z.string(),
    severity: bugSeveritySchema,
    priority: bugPrioritySchema,
    status: bugStatusSchema,
    version: z.string(),
    module: z.string(),
    stepsToReproduce: z.string(),
    expectedResult: z.string(),
    actualResult: z.string(),
    logs: z.string(),
    fix: z.string(),
    fixedBy: z.string(),
  })
  .merge(timestampsSchema);

export type CreateBugInput = z.input<typeof createBugSchema>;
export type UpdateBugInput = z.input<typeof updateBugSchema>;
export type Bug = z.infer<typeof bugSchema>;

/** Rótulos legíveis (pt-BR). */
export const BUG_SEVERITY_LABELS: Record<BugSeverity, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const BUG_PRIORITY_LABELS: Record<BugPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em correção',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  WONT_FIX: 'Não será corrigido',
};
