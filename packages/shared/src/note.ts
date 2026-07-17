import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * `Note` é a entidade-exemplo da fundação. Ela existe apenas para validar a stack
 * ponta a ponta (front → API → SQLite) e servir de referência de padrão CRUD para
 * os módulos reais que virão depois.
 */

/** Payload para criar uma nota. */
export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  content: z.string().trim().max(10_000).optional().default(''),
});

/** Payload para atualizar uma nota (todos os campos opcionais). */
export const updateNoteSchema = createNoteSchema.partial();

/** Entidade completa retornada pela API. */
export const noteSchema = createNoteSchema.extend({
  id: idSchema,
  content: z.string(),
}).merge(timestampsSchema);

// z.input: reflete o payload aceito pela API (content é opcional; o default é
// aplicado na validação). z.infer traria content já como obrigatório.
export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
export type Note = z.infer<typeof noteSchema>;
