import { z } from 'zod';
import { idSchema } from './common';

/**
 * Contratos de **Tokens de API** — credenciais pessoais (ex.: extensão do VSCode)
 * que embutem o workspace e substituem o login por senha em integrações.
 */

/** Criar um token de API (para o workspace ativo). */
export const createApiTokenSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao token').max(120),
});
export type CreateApiTokenInput = z.input<typeof createApiTokenSchema>;

/** Token retornado nas listagens (sem o valor secreto). */
export const apiTokenSchema = z.object({
  id: idSchema,
  name: z.string(),
  lastUsedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type ApiToken = z.infer<typeof apiTokenSchema>;

/** Resposta da criação — inclui o valor do token UMA única vez. */
export const apiTokenCreatedSchema = apiTokenSchema.extend({
  token: z.string(),
});
export type ApiTokenCreated = z.infer<typeof apiTokenCreatedSchema>;
