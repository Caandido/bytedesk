import { z } from 'zod';

/**
 * Contrato do módulo **Estatísticas** — métricas agregadas de todos os módulos,
 * calculadas no backend (`GET /api/stats`). As distribuições já vêm com rótulos
 * prontos (pt-BR) para o frontend só desenhar.
 */

/** Fatia rotulada de uma distribuição (ex.: status, severidade, tecnologia). */
export const statSliceSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type StatSlice = z.infer<typeof statSliceSchema>;

export const statsSchema = z.object({
  projects: z.object({
    total: z.number().int(),
    active: z.number().int(),
    completed: z.number().int(),
    archived: z.number().int(),
  }),
  studies: z.object({
    total: z.number().int(),
    inProgress: z.number().int(),
    completed: z.number().int(),
    hoursStudied: z.number(),
  }),
  tasks: z.object({
    total: z.number().int(),
    done: z.number().int(),
    hoursSpent: z.number(),
  }),
  bugs: z.object({
    total: z.number().int(),
    open: z.number().int(),
    resolved: z.number().int(),
  }),
  roadmaps: z.object({
    total: z.number().int(),
    itemsTotal: z.number().int(),
    itemsDone: z.number().int(),
  }),
  wiki: z.object({
    total: z.number().int(),
    favorites: z.number().int(),
  }),
  /** Dias com atividade (por createdAt) e sequência atual até hoje. */
  activity: z.object({
    activeDays: z.number().int(),
    currentStreak: z.number().int(),
  }),
  technologies: z.array(statSliceSchema),
  studyByStatus: z.array(statSliceSchema),
  taskByStatus: z.array(statSliceSchema),
  bugBySeverity: z.array(statSliceSchema),
});

export type Stats = z.infer<typeof statsSchema>;
