import { z } from 'zod';

/**
 * Campos de auditoria presentes em toda entidade persistida.
 * A spec exige que "todo dado possua data de criação e última atualização".
 */
export const timestampsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Timestamps = z.infer<typeof timestampsSchema>;

/** Identificador padrão das entidades (cuid gerado pelo Prisma). */
export const idSchema = z.string().min(1);
