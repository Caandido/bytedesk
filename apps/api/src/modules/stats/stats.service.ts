import { Injectable } from '@nestjs/common';
import {
  STUDY_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
  BUG_SEVERITY_LABELS,
  type Stats,
  type StatSlice,
} from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';

type Row<T extends string> = { _count: { _all: number } } & Record<T, string>;

/** Soma as contagens de um groupBy num mapa status/severidade → total. */
function toMap<T extends string>(rows: Row<T>[], key: T): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r[key], r._count._all);
  return map;
}

const sum = (map: Map<string, number>, keys: string[]) =>
  keys.reduce((acc, k) => acc + (map.get(k) ?? 0), 0);

const total = (map: Map<string, number>) =>
  [...map.values()].reduce((a, b) => a + b, 0);

/** Monta uma distribuição rotulada seguindo a ordem do mapa de rótulos. */
function distribution(
  map: Map<string, number>,
  labels: Record<string, string>,
  order: string[],
): StatSlice[] {
  return order.map((key) => ({ label: labels[key], value: map.get(key) ?? 0 }));
}

const asDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Métricas agregadas de todos os módulos. Contadores/distribuições via groupBy,
 * somas via aggregate, tecnologias e sequência de dias calculadas em memória.
 */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getData(): Promise<Stats> {
    const [
      projectCounts,
      studyCounts,
      studyHours,
      taskCounts,
      taskHours,
      bugStatusCounts,
      bugSeverityCounts,
      roadmapTotal,
      roadmapItems,
      wikiTotal,
      wikiFavorites,
      projectTechs,
      studyTechs,
      activityDates,
    ] = await Promise.all([
      this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.study.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.study.aggregate({ _sum: { hoursStudied: true } }),
      this.prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.task.aggregate({ _sum: { spentHours: true } }),
      this.prisma.bug.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.bug.groupBy({ by: ['severity'], _count: { _all: true } }),
      this.prisma.roadmap.count(),
      this.prisma.roadmapItem.groupBy({ by: ['done'], _count: { _all: true } }),
      this.prisma.wikiPage.count(),
      this.prisma.wikiPage.count({ where: { favorite: true } }),
      this.prisma.project.findMany({ select: { technologies: true } }),
      this.prisma.study.findMany({ select: { technology: true } }),
      this.collectActivityDates(),
    ]);

    const projectMap = toMap(projectCounts, 'status');
    const studyMap = toMap(studyCounts, 'status');
    const taskMap = toMap(taskCounts, 'status');
    const bugStatusMap = toMap(bugStatusCounts, 'status');
    const bugSeverityMap = toMap(bugSeverityCounts, 'severity');

    const itemsDone = roadmapItems
      .filter((r) => r.done)
      .reduce((a, r) => a + r._count._all, 0);
    const itemsTotal = roadmapItems.reduce((a, r) => a + r._count._all, 0);

    return {
      projects: {
        total: total(projectMap),
        active: sum(projectMap, ['PLANNING', 'IN_PROGRESS']),
        completed: sum(projectMap, ['COMPLETED']),
        archived: sum(projectMap, ['ARCHIVED']),
      },
      studies: {
        total: total(studyMap),
        inProgress: sum(studyMap, ['IN_PROGRESS']),
        completed: sum(studyMap, ['COMPLETED']),
        hoursStudied: studyHours._sum.hoursStudied ?? 0,
      },
      tasks: {
        total: total(taskMap),
        done: sum(taskMap, ['DONE']),
        hoursSpent: taskHours._sum.spentHours ?? 0,
      },
      bugs: {
        total: total(bugStatusMap),
        open: sum(bugStatusMap, ['OPEN', 'IN_PROGRESS']),
        resolved: sum(bugStatusMap, ['RESOLVED']),
      },
      roadmaps: { total: roadmapTotal, itemsTotal, itemsDone },
      wiki: { total: wikiTotal, favorites: wikiFavorites },
      activity: this.computeActivity(activityDates),
      technologies: this.topTechnologies(projectTechs, studyTechs),
      studyByStatus: distribution(
        studyMap,
        STUDY_STATUS_LABELS,
        Object.keys(STUDY_STATUS_LABELS),
      ),
      taskByStatus: distribution(taskMap, TASK_STATUS_LABELS, TASK_STATUS_ORDER),
      bugBySeverity: distribution(
        bugSeverityMap,
        BUG_SEVERITY_LABELS,
        Object.keys(BUG_SEVERITY_LABELS),
      ),
    };
  }

  private async collectActivityDates(): Promise<Date[]> {
    const [studies, projects, tasks, bugs, roadmaps, wiki] = await Promise.all([
      this.prisma.study.findMany({ select: { createdAt: true } }),
      this.prisma.project.findMany({ select: { createdAt: true } }),
      this.prisma.task.findMany({ select: { createdAt: true } }),
      this.prisma.bug.findMany({ select: { createdAt: true } }),
      this.prisma.roadmap.findMany({ select: { createdAt: true } }),
      this.prisma.wikiPage.findMany({ select: { createdAt: true } }),
    ]);
    return [...studies, ...projects, ...tasks, ...bugs, ...roadmaps, ...wiki].map(
      (e) => e.createdAt,
    );
  }

  private computeActivity(dates: Date[]): Stats['activity'] {
    const days = new Set(dates.map(asDay));
    let currentStreak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);
    while (days.has(asDay(cursor))) {
      currentStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { activeDays: days.size, currentStreak };
  }

  private topTechnologies(
    projects: { technologies: string[] }[],
    studies: { technology: string }[],
  ): StatSlice[] {
    const counts = new Map<string, number>();
    const add = (raw: string) => {
      const name = raw.trim();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    };
    for (const p of projects) for (const t of p.technologies) add(t);
    for (const s of studies) add(s.technology);
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }
}
