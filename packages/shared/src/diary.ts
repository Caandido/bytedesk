import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do módulo **Diário de Desenvolvimento** — registros de sessões de
 * trabalho/estudo. Humor e produtividade são notas de 1 a 5.
 */

const rating = z.number().int().min(1).max(5);
const longText = z.string().max(20_000).optional().default('');

/** Payload para criar um registro. */
export const createDiaryEntrySchema = z.object({
  date: z.coerce.date().optional(),
  minutesSpent: z.number().int().min(0).max(100_000).optional().default(0),
  done: longText,
  problems: longText,
  solutions: longText,
  nextSteps: longText,
  mood: rating.optional().default(3),
  productivity: rating.optional().default(3),
  projectId: idSchema.nullable().optional(),
});

/** Payload para atualizar um registro (todos os campos opcionais). */
export const updateDiaryEntrySchema = createDiaryEntrySchema.partial();

/** Entidade completa retornada pela API (com nome do projeto, se houver). */
export const diaryEntrySchema = z
  .object({
    id: idSchema,
    date: z.coerce.date(),
    minutesSpent: z.number().int(),
    done: z.string(),
    problems: z.string(),
    solutions: z.string(),
    nextSteps: z.string(),
    mood: z.number().int(),
    productivity: z.number().int(),
    projectId: idSchema.nullable(),
    projectName: z.string().nullable(),
  })
  .merge(timestampsSchema);

export type CreateDiaryEntryInput = z.input<typeof createDiaryEntrySchema>;
export type UpdateDiaryEntryInput = z.input<typeof updateDiaryEntrySchema>;
export type DiaryEntry = z.infer<typeof diaryEntrySchema>;

/** Rótulos e emojis de humor (1–5). */
export const MOOD_EMOJI = ['😞', '😕', '😐', '🙂', '🤩'];
export const moodEmoji = (v: number) => MOOD_EMOJI[Math.min(4, Math.max(1, v) - 1)];
