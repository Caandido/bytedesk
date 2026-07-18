import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do sub-módulo **Documentação** de um projeto — páginas em Markdown.
 */

/** Payload para criar uma página de documentação. */
export const createDocSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  content: z.string().max(200_000).optional().default(''),
});

/** Payload para atualizar uma página (todos os campos opcionais). */
export const updateDocSchema = createDocSchema.partial();

/** Entidade completa retornada pela API. */
export const docSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    title: z.string(),
    content: z.string(),
    position: z.number().int(),
  })
  .merge(timestampsSchema);

export type CreateDocInput = z.input<typeof createDocSchema>;
export type UpdateDocInput = z.input<typeof updateDocSchema>;
export type ProjectDoc = z.infer<typeof docSchema>;
