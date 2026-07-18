import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';
import { objectiveSchema } from './study';

/**
 * Contratos do módulo **Projetos**. Segue o mesmo padrão de `study.ts`. Reaproveita
 * os schemas de objetivo (checklist) — a forma do item é idêntica entre os módulos.
 */

/** Situação do projeto — espelha o enum `ProjectStatus` do Prisma. */
export const projectStatusSchema = z.enum([
  'PLANNING',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/** Prioridade — espelha o enum `ProjectPriority` do Prisma. */
export const projectPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);
export type ProjectPriority = z.infer<typeof projectPrioritySchema>;

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .url('URL inválida')
  .or(z.literal(''))
  .optional()
  .default('');

/** Payload para criar um projeto. Só `name` é obrigatório. */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(200),
  description: z.string().max(50_000).optional().default(''),
  client: z.string().trim().max(160).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  technologies: z
    .array(z.string().trim().min(1).max(40))
    .optional()
    .default([]),
  status: projectStatusSchema.optional().default('PLANNING'),
  priority: projectPrioritySchema.optional().default('MEDIUM'),
  version: z.string().trim().max(40).optional().default(''),
  repoUrl: optionalUrl,
  figmaUrl: optionalUrl,
  deployUrl: optionalUrl,
  docsUrl: optionalUrl,
  startDate: z.coerce.date().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(),
  // Git (campos manuais, sem integração ainda)
  gitBranch: z.string().trim().max(120).optional().default(''),
  lastCommit: z.string().trim().max(200).optional().default(''),
  nextVersion: z.string().trim().max(40).optional().default(''),
  gitTags: z.array(z.string().trim().min(1).max(60)).optional().default([]),
});

/** Payload para atualizar um projeto (todos os campos opcionais). */
export const updateProjectSchema = createProjectSchema.partial();

/** Entidade completa de projeto retornada pela API. */
export const projectSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    description: z.string(),
    client: z.string(),
    category: z.string(),
    technologies: z.array(z.string()),
    status: projectStatusSchema,
    priority: projectPrioritySchema,
    version: z.string(),
    repoUrl: z.string(),
    figmaUrl: z.string(),
    deployUrl: z.string(),
    docsUrl: z.string(),
    startDate: z.coerce.date().nullable(),
    deadline: z.coerce.date().nullable(),
    gitBranch: z.string(),
    lastCommit: z.string(),
    nextVersion: z.string(),
    gitTags: z.array(z.string()),
    objectives: z.array(objectiveSchema).optional(),
  })
  .merge(timestampsSchema);

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
export type Project = z.infer<typeof projectSchema>;

// Os contratos de objetivo (checklist) são compartilhados e já exportados por
// `study.ts` (createObjectiveSchema, updateObjectiveSchema, objectiveSchema,
// CreateObjectiveInput, StudyObjective) — reutilizados também pelos projetos.

/** Rótulos legíveis (pt-BR). */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planejamento',
  IN_PROGRESS: 'Em desenvolvimento',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
  ARCHIVED: 'Arquivado',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
