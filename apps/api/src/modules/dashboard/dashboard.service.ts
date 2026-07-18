import { Injectable } from '@nestjs/common';
import type { DashboardData } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Linha de contagem agrupada por status (`groupBy` do Prisma). */
type StatusCount<T extends string> = { status: T; _count: { _all: number } };

/** Soma as contagens dos grupos cujo status está em `statuses`. */
function sumStatuses<T extends string>(
  rows: StatusCount<T>[],
  statuses: readonly T[],
): number {
  return rows
    .filter((r) => statuses.includes(r.status))
    .reduce((acc, r) => acc + r._count._all, 0);
}

const totalOf = <T extends string>(rows: StatusCount<T>[]): number =>
  rows.reduce((acc, r) => acc + r._count._all, 0);

/**
 * Agrega os dados de todos os módulos para o Dashboard em uma única rodada de
 * consultas (contagens via `groupBy` + listas recentes), evitando N+1 no frontend.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getData(): Promise<DashboardData> {
    const [
      studyCounts,
      studyHours,
      projectCounts,
      taskCounts,
      bugCounts,
      roadmapTotal,
      roadmapItems,
      wikiTotal,
      wikiFavorites,
      recentStudies,
      upcomingTasks,
      recentBugs,
    ] = await Promise.all([
      this.prisma.study.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.study.aggregate({ _sum: { hoursStudied: true } }),
      this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.bug.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.roadmap.count(),
      this.prisma.roadmapItem.groupBy({ by: ['done'], _count: { _all: true } }),
      this.prisma.wikiPage.count(),
      this.prisma.wikiPage.count({ where: { favorite: true } }),
      this.prisma.study.findMany({
        where: { status: 'IN_PROGRESS' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { objectives: { select: { done: true } } },
      }),
      this.prisma.task.findMany({
        where: { status: { not: 'DONE' } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: { project: { select: { name: true } } },
      }),
      this.prisma.bug.findMany({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: { project: { select: { name: true } } },
      }),
    ]);

    return {
      studies: {
        total: totalOf(studyCounts),
        inProgress: sumStatuses(studyCounts, ['IN_PROGRESS']),
        completed: sumStatuses(studyCounts, ['COMPLETED']),
        hoursStudied: studyHours._sum.hoursStudied ?? 0,
      },
      projects: {
        total: totalOf(projectCounts),
        active: sumStatuses(projectCounts, ['PLANNING', 'IN_PROGRESS']),
        completed: sumStatuses(projectCounts, ['COMPLETED']),
      },
      tasks: {
        total: totalOf(taskCounts),
        done: sumStatuses(taskCounts, ['DONE']),
        pending: sumStatuses(taskCounts, [
          'BACKLOG',
          'TODO',
          'IN_PROGRESS',
          'TESTING',
        ]),
      },
      bugs: {
        total: totalOf(bugCounts),
        open: sumStatuses(bugCounts, ['OPEN', 'IN_PROGRESS']),
        resolved: sumStatuses(bugCounts, ['RESOLVED']),
      },
      roadmaps: {
        total: roadmapTotal,
        itemsTotal: roadmapItems.reduce((a, r) => a + r._count._all, 0),
        itemsDone: roadmapItems
          .filter((r) => r.done)
          .reduce((a, r) => a + r._count._all, 0),
      },
      wiki: { total: wikiTotal, favorites: wikiFavorites },
      recentStudies: recentStudies.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        hoursStudied: s.hoursStudied,
        objectivesTotal: s.objectives.length,
        objectivesDone: s.objectives.filter((o) => o.done).length,
      })),
      upcomingTasks: upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: t.project.name,
      })),
      recentBugs: recentBugs.map((b) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        severity: b.severity,
        projectId: b.projectId,
        projectName: b.project.name,
      })),
    };
  }
}
