import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos de **Favoritos transversais** — favoritar entidades de qualquer módulo.
 */

/** Tipo da entidade favoritada. */
export const favoriteTypeSchema = z.enum([
  'STUDY',
  'PROJECT',
  'ROADMAP',
  'WIKI',
  'ERROR',
]);
export type FavoriteType = z.infer<typeof favoriteTypeSchema>;

/** Payload para favoritar uma entidade. */
export const createFavoriteSchema = z.object({
  type: favoriteTypeSchema,
  entityId: idSchema,
  title: z.string().trim().min(1).max(300),
  subtitle: z.string().trim().max(200).optional().default(''),
  url: z.string().trim().min(1).max(500),
});

/** Entidade favorito retornada pela API. */
export const favoriteSchema = z
  .object({
    id: idSchema,
    type: favoriteTypeSchema,
    entityId: idSchema,
    title: z.string(),
    subtitle: z.string(),
    url: z.string(),
  })
  .merge(timestampsSchema.pick({ createdAt: true }));

export type CreateFavoriteInput = z.input<typeof createFavoriteSchema>;
export type Favorite = z.infer<typeof favoriteSchema>;

/** Rótulos (pt-BR) dos tipos. */
export const FAVORITE_TYPE_LABELS: Record<FavoriteType, string> = {
  STUDY: 'Estudos',
  PROJECT: 'Projetos',
  ROADMAP: 'Roadmaps',
  WIKI: 'Conhecimento',
  ERROR: 'Banco de Erros',
};
