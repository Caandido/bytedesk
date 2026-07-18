import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do módulo **Estudos**. Fonte única da verdade compartilhada entre o
 * backend (DTOs via nestjs-zod) e o frontend (validação de formulário). Segue o
 * mesmo padrão da entidade-exemplo `note.ts`.
 */

/** Situação do estudo — espelha o enum `StudyStatus` do Prisma. */
export const studyStatusSchema = z.enum([
  'PLANNED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
]);
export type StudyStatus = z.infer<typeof studyStatusSchema>;

/** Nível de domínio — espelha o enum `StudyLevel` do Prisma. */
export const studyLevelSchema = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]);
export type StudyLevel = z.infer<typeof studyLevelSchema>;

/** Link externo associado a um estudo (documentação, vídeo, artigo…). */
export const linkSchema = z.object({
  label: z.string().trim().min(1, 'O rótulo é obrigatório').max(120),
  url: z.string().trim().url('URL inválida').max(2048),
});
export type Link = z.infer<typeof linkSchema>;

// ─── Objetivos (checklist) ───────────────────────────────────────────────────

/** Payload para criar um objetivo. */
export const createObjectiveSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
});

/** Payload para atualizar um objetivo (marcar como feito e/ou renomear). */
export const updateObjectiveSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    done: z.boolean(),
    position: z.number().int().min(0),
  })
  .partial();

/** Entidade completa de objetivo retornada pela API. */
export const objectiveSchema = z
  .object({
    id: idSchema,
    studyId: idSchema,
    title: z.string(),
    done: z.boolean(),
    position: z.number().int(),
  })
  .merge(timestampsSchema);

export type CreateObjectiveInput = z.input<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.input<typeof updateObjectiveSchema>;
export type StudyObjective = z.infer<typeof objectiveSchema>;

// ─── Seções (cards de conteúdo Markdown) ─────────────────────────────────────

/** Payload para criar uma seção. */
export const createSectionSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  content: z.string().max(200_000).optional().default(''),
});

/** Payload para atualizar uma seção. */
export const updateSectionSchema = createSectionSchema.partial();

/** Entidade completa de seção retornada pela API. */
export const sectionSchema = z
  .object({
    id: idSchema,
    studyId: idSchema,
    title: z.string(),
    content: z.string(),
    position: z.number().int(),
  })
  .merge(timestampsSchema);

export type CreateSectionInput = z.input<typeof createSectionSchema>;
export type UpdateSectionInput = z.input<typeof updateSectionSchema>;
export type StudySection = z.infer<typeof sectionSchema>;

// ─── Estudo ──────────────────────────────────────────────────────────────────

/** Payload para criar um estudo. Só `name` é obrigatório; o resto tem default. */
export const createStudySchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(200),
  category: z.string().trim().max(120).optional().default(''),
  technology: z.string().trim().max(120).optional().default(''),
  description: z.string().trim().max(10_000).optional().default(''),
  notes: z.string().max(50_000).optional().default(''),
  status: studyStatusSchema.optional().default('PLANNED'),
  level: studyLevelSchema.optional().default('BEGINNER'),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
  links: z.array(linkSchema).optional().default([]),
  hoursStudied: z.number().min(0).max(100_000).optional().default(0),
  // Aceita ISO string ou Date; a API persiste como DateTime. Null limpa o campo.
  startDate: z.coerce.date().nullable().optional(),
});

/** Payload para atualizar um estudo (todos os campos opcionais). */
export const updateStudySchema = createStudySchema.partial();

/** Entidade completa de estudo retornada pela API. */
export const studySchema = z
  .object({
    id: idSchema,
    name: z.string(),
    category: z.string(),
    technology: z.string(),
    description: z.string(),
    notes: z.string(),
    status: studyStatusSchema,
    level: studyLevelSchema,
    tags: z.array(z.string()),
    links: z.array(linkSchema),
    hoursStudied: z.number(),
    startDate: z.coerce.date().nullable(),
    objectives: z.array(objectiveSchema).optional(),
    sections: z.array(sectionSchema).optional(),
  })
  .merge(timestampsSchema);

// z.input: reflete o payload aceito pela API (campos com default são opcionais na
// entrada). z.infer traria tudo como obrigatório.
export type CreateStudyInput = z.input<typeof createStudySchema>;
export type UpdateStudyInput = z.input<typeof updateStudySchema>;
export type Study = z.infer<typeof studySchema>;

/** Rótulos legíveis (pt-BR) para exibição no frontend. */
export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  PLANNED: 'Planejado',
  IN_PROGRESS: 'Em andamento',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
};

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};
