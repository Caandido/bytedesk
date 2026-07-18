import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do sub-módulo **Banco de Ideias** de um projeto.
 */

/** Nível (prioridade/impacto/complexidade) — espelha o enum `IdeaRating`. */
export const ideaRatingSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type IdeaRating = z.infer<typeof ideaRatingSchema>;

/** Situação no funil — espelha o enum `IdeaStatus`. */
export const ideaStatusSchema = z.enum([
  'NEW',
  'CONSIDERING',
  'PLANNED',
  'DONE',
  'DISCARDED',
]);
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;

/** Payload para criar uma ideia. Só `title` é obrigatório. */
export const createIdeaSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  description: z.string().max(10_000).optional().default(''),
  priority: ideaRatingSchema.optional().default('MEDIUM'),
  impact: ideaRatingSchema.optional().default('MEDIUM'),
  complexity: ideaRatingSchema.optional().default('MEDIUM'),
  status: ideaStatusSchema.optional().default('NEW'),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
});

/** Payload para atualizar uma ideia (todos os campos opcionais). */
export const updateIdeaSchema = createIdeaSchema.partial();

/** Entidade completa retornada pela API. */
export const ideaSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    title: z.string(),
    description: z.string(),
    priority: ideaRatingSchema,
    impact: ideaRatingSchema,
    complexity: ideaRatingSchema,
    status: ideaStatusSchema,
    tags: z.array(z.string()),
  })
  .merge(timestampsSchema);

export type CreateIdeaInput = z.input<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.input<typeof updateIdeaSchema>;
export type Idea = z.infer<typeof ideaSchema>;

/** Rótulos legíveis (pt-BR). */
export const IDEA_RATING_LABELS: Record<IdeaRating, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  NEW: 'Nova',
  CONSIDERING: 'Avaliando',
  PLANNED: 'Planejada',
  DONE: 'Feita',
  DISCARDED: 'Descartada',
};
