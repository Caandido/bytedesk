import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do módulo **Banco de Erros** — base pesquisável de erros conhecidos,
 * com motivo e solução.
 */

/** Payload para criar um erro conhecido. Só `title` é obrigatório. */
export const createKnownErrorSchema = z.object({
  title: z.string().trim().min(1, 'O erro é obrigatório').max(300),
  cause: z.string().max(10_000).optional().default(''),
  solution: z.string().max(20_000).optional().default(''),
  technology: z.string().trim().max(120).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
});

/** Payload para atualizar (todos os campos opcionais). */
export const updateKnownErrorSchema = createKnownErrorSchema.partial();

/** Entidade completa retornada pela API. */
export const knownErrorSchema = z
  .object({
    id: idSchema,
    title: z.string(),
    cause: z.string(),
    solution: z.string(),
    technology: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
  })
  .merge(timestampsSchema);

export type CreateKnownErrorInput = z.input<typeof createKnownErrorSchema>;
export type UpdateKnownErrorInput = z.input<typeof updateKnownErrorSchema>;
export type KnownError = z.infer<typeof knownErrorSchema>;
