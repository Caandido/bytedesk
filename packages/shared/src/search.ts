import { z } from 'zod';
import { idSchema } from './common';

/**
 * Contrato da **Pesquisa Global** (Ctrl+K). O backend busca em vários módulos e
 * devolve uma lista unificada de resultados prontos para exibir e navegar.
 */

/** Tipo da entidade encontrada — define o ícone e a rota de navegação no front. */
export const searchResultTypeSchema = z.enum([
  'study',
  'project',
  'task',
  'bug',
  'roadmap',
  'wiki',
  'error',
]);
export type SearchResultType = z.infer<typeof searchResultTypeSchema>;

export const searchResultSchema = z.object({
  type: searchResultTypeSchema,
  id: idSchema,
  title: z.string(),
  subtitle: z.string(),
  /** Projeto ao qual o item pertence (para tarefas e bugs). */
  projectId: idSchema.optional(),
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const searchResponseSchema = z.array(searchResultSchema);
export type SearchResponse = z.infer<typeof searchResponseSchema>;

/** Rótulos (pt-BR) dos grupos de resultado. */
export const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  study: 'Estudos',
  project: 'Projetos',
  task: 'Tarefas',
  bug: 'Bugs',
  roadmap: 'Roadmaps',
  wiki: 'Conhecimento',
  error: 'Banco de Erros',
};
