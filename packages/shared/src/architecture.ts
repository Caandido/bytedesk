import { z } from 'zod';
import { idSchema } from './common';

/**
 * Contratos do sub-módulo **Arquitetura** de um projeto (1-1): documento com
 * diagramas (Mermaid), estrutura de pastas e dependências.
 */

/** Uma dependência do projeto. */
export const dependencySchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(160),
  version: z.string().trim().max(60).optional().default(''),
});
export type Dependency = z.infer<typeof dependencySchema>;

/** Payload para salvar a arquitetura (upsert; todos os campos opcionais). */
export const updateArchitectureSchema = z.object({
  content: z.string().max(200_000).optional(),
  folderStructure: z.string().max(50_000).optional(),
  dependencies: z.array(dependencySchema).optional(),
});
export type UpdateArchitectureInput = z.input<typeof updateArchitectureSchema>;

/** Arquitetura retornada pela API (defaults vazios se ainda não salva). */
export const architectureSchema = z.object({
  projectId: idSchema,
  content: z.string(),
  folderStructure: z.string(),
  dependencies: z.array(dependencySchema),
});
export type ProjectArchitecture = z.infer<typeof architectureSchema>;
