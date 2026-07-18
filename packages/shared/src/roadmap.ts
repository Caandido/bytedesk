import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';
import { linkSchema } from './study';

/**
 * Contratos do módulo **Roadmaps** (trilhas de aprendizado). Reaproveita `linkSchema`
 * de `study.ts` para os recursos de cada item.
 */

// ─── Item da trilha ──────────────────────────────────────────────────────────

/** Payload para criar um item de trilha. */
export const createRoadmapItemSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  description: z.string().max(10_000).optional().default(''),
  links: z.array(linkSchema).optional().default([]),
  recommendedTime: z.string().trim().max(60).optional().default(''),
});

/** Payload para atualizar um item (marcar feito, reordenar, editar). */
export const updateRoadmapItemSchema = createRoadmapItemSchema
  .extend({
    done: z.boolean(),
    position: z.number().int().min(0),
  })
  .partial();

/** Entidade completa de item retornada pela API. */
export const roadmapItemSchema = z
  .object({
    id: idSchema,
    roadmapId: idSchema,
    title: z.string(),
    description: z.string(),
    links: z.array(linkSchema),
    recommendedTime: z.string(),
    done: z.boolean(),
    position: z.number().int(),
  })
  .merge(timestampsSchema);

export type CreateRoadmapItemInput = z.input<typeof createRoadmapItemSchema>;
export type UpdateRoadmapItemInput = z.input<typeof updateRoadmapItemSchema>;
export type RoadmapItem = z.infer<typeof roadmapItemSchema>;

// ─── Trilha ──────────────────────────────────────────────────────────────────

/** Payload para criar uma trilha. Só `name` é obrigatório. */
export const createRoadmapSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(200),
  description: z.string().max(10_000).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  tags: z.array(z.string().trim().min(1).max(40)).optional().default([]),
});

/** Payload para atualizar uma trilha (todos os campos opcionais). */
export const updateRoadmapSchema = createRoadmapSchema.partial();

/** Entidade completa de trilha retornada pela API. */
export const roadmapSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    items: z.array(roadmapItemSchema).optional(),
  })
  .merge(timestampsSchema);

export type CreateRoadmapInput = z.input<typeof createRoadmapSchema>;
export type UpdateRoadmapInput = z.input<typeof updateRoadmapSchema>;
export type Roadmap = z.infer<typeof roadmapSchema>;

// ─── Catálogo (importar de roadmap.sh) ───────────────────────────────────────

/** Resumo de um template do catálogo, para listar antes de importar. */
export const roadmapTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  url: z.string(),
  itemCount: z.number().int(),
});
export type RoadmapTemplateSummary = z.infer<typeof roadmapTemplateSchema>;

/** Item de um template (com descrição e links). */
export const roadmapTemplateItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  links: z.array(linkSchema).optional(),
});
export type RoadmapTemplateItem = z.infer<typeof roadmapTemplateItemSchema>;

/** Template completo (guia) com todos os itens. */
export const roadmapTemplateDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  url: z.string(),
  items: z.array(roadmapTemplateItemSchema),
});
export type RoadmapTemplateDetail = z.infer<typeof roadmapTemplateDetailSchema>;

/** Payload para importar um template do catálogo. */
export const importRoadmapSchema = z.object({
  templateId: z.string().min(1),
});
export type ImportRoadmapInput = z.input<typeof importRoadmapSchema>;
