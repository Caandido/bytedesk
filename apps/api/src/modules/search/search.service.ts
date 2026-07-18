import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SearchResult } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Quantidade máxima de resultados por módulo. */
const PER_TYPE = 5;

/**
 * Pesquisa global: busca o termo em estudos, projetos, tarefas e bugs
 * (case-insensitive) e devolve uma lista unificada de resultados.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(rawQuery: string): Promise<SearchResult[]> {
    const term = rawQuery?.trim() ?? '';
    if (term.length < 2) return [];

    const like: Prisma.StringFilter = { contains: term, mode: 'insensitive' };

    const [studies, projects, tasks, bugs, roadmaps] = await Promise.all([
      this.prisma.study.findMany({
        where: {
          OR: [
            { name: like },
            { technology: like },
            { category: like },
            { description: like },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: PER_TYPE,
        select: { id: true, name: true, technology: true },
      }),
      this.prisma.project.findMany({
        where: {
          OR: [
            { name: like },
            { client: like },
            { category: like },
            { description: like },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: PER_TYPE,
        select: { id: true, name: true, client: true },
      }),
      this.prisma.task.findMany({
        where: { OR: [{ title: like }, { description: like }] },
        orderBy: { updatedAt: 'desc' },
        take: PER_TYPE,
        select: {
          id: true,
          title: true,
          projectId: true,
          project: { select: { name: true } },
        },
      }),
      this.prisma.bug.findMany({
        where: { OR: [{ title: like }, { module: like }] },
        orderBy: { updatedAt: 'desc' },
        take: PER_TYPE,
        select: {
          id: true,
          title: true,
          projectId: true,
          project: { select: { name: true } },
        },
      }),
      this.prisma.roadmap.findMany({
        where: { OR: [{ name: like }, { category: like }] },
        orderBy: { updatedAt: 'desc' },
        take: PER_TYPE,
        select: { id: true, name: true, category: true },
      }),
    ]);

    return [
      ...studies.map<SearchResult>((s) => ({
        type: 'study',
        id: s.id,
        title: s.name,
        subtitle: s.technology || 'Estudo',
      })),
      ...projects.map<SearchResult>((p) => ({
        type: 'project',
        id: p.id,
        title: p.name,
        subtitle: p.client || 'Projeto',
      })),
      ...tasks.map<SearchResult>((t) => ({
        type: 'task',
        id: t.id,
        title: t.title,
        subtitle: t.project.name,
        projectId: t.projectId,
      })),
      ...bugs.map<SearchResult>((b) => ({
        type: 'bug',
        id: b.id,
        title: b.title,
        subtitle: b.project.name,
        projectId: b.projectId,
      })),
      ...roadmaps.map<SearchResult>((r) => ({
        type: 'roadmap',
        id: r.id,
        title: r.name,
        subtitle: r.category || 'Roadmap',
      })),
    ];
  }
}
