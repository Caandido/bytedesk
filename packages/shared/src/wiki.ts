import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do módulo **Conhecimento** (wiki pessoal) — páginas em Markdown com
 * categoria, tags e favorito.
 */

/** Payload para criar uma página. */
export const createWikiPageSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  content: z.string().max(200_000).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
  favorite: z.boolean().optional().default(false),
});

/** Payload para atualizar uma página (todos os campos opcionais). */
export const updateWikiPageSchema = createWikiPageSchema.partial();

/** Entidade completa retornada pela API. */
export const wikiPageSchema = z
  .object({
    id: idSchema,
    title: z.string(),
    content: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    favorite: z.boolean(),
  })
  .merge(timestampsSchema);

export type CreateWikiPageInput = z.input<typeof createWikiPageSchema>;
export type UpdateWikiPageInput = z.input<typeof updateWikiPageSchema>;
export type WikiPage = z.infer<typeof wikiPageSchema>;
