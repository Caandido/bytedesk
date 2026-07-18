import { z } from 'zod';
import { idSchema } from './common';
import { studyStatusSchema } from './study';
import { taskStatusSchema, taskPrioritySchema } from './task';
import { bugSeveritySchema, bugStatusSchema } from './bug';

/**
 * Contrato do **Dashboard** — dados agregados de todos os módulos, calculados no
 * backend em uma única chamada (`GET /api/dashboard`).
 */

/** Resumo de um estudo em andamento exibido no dashboard. */
export const dashboardStudySchema = z.object({
  id: idSchema,
  name: z.string(),
  status: studyStatusSchema,
  hoursStudied: z.number(),
  objectivesTotal: z.number().int(),
  objectivesDone: z.number().int(),
});

/** Resumo de uma tarefa pendente (com o nome do projeto). */
export const dashboardTaskSchema = z.object({
  id: idSchema,
  title: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  projectId: idSchema,
  projectName: z.string(),
});

/** Resumo de um bug aberto (com o nome do projeto). */
export const dashboardBugSchema = z.object({
  id: idSchema,
  title: z.string(),
  status: bugStatusSchema,
  severity: bugSeveritySchema,
  projectId: idSchema,
  projectName: z.string(),
});

export const dashboardSchema = z.object({
  studies: z.object({
    total: z.number().int(),
    inProgress: z.number().int(),
    completed: z.number().int(),
    hoursStudied: z.number(),
  }),
  projects: z.object({
    total: z.number().int(),
    active: z.number().int(),
    completed: z.number().int(),
  }),
  tasks: z.object({
    total: z.number().int(),
    done: z.number().int(),
    pending: z.number().int(),
  }),
  bugs: z.object({
    total: z.number().int(),
    open: z.number().int(),
    resolved: z.number().int(),
  }),
  recentStudies: z.array(dashboardStudySchema),
  upcomingTasks: z.array(dashboardTaskSchema),
  recentBugs: z.array(dashboardBugSchema),
});

export type DashboardStudy = z.infer<typeof dashboardStudySchema>;
export type DashboardTask = z.infer<typeof dashboardTaskSchema>;
export type DashboardBug = z.infer<typeof dashboardBugSchema>;
export type DashboardData = z.infer<typeof dashboardSchema>;
