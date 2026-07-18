import { Injectable } from '@nestjs/common';
import type { CalendarEvent } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';

const asDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Agrega eventos datados de vários módulos para o calendário: prazos e início de
 * projetos, início de estudos, lançamentos de versão e registros de diário.
 */
@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(workspaceId: string): Promise<CalendarEvent[]> {
    const [projects, studies, versions, diary] = await Promise.all([
      this.prisma.project.findMany({
        where: { workspaceId },
        select: { id: true, name: true, startDate: true, deadline: true },
      }),
      this.prisma.study.findMany({
        where: { workspaceId, startDate: { not: null } },
        select: { id: true, name: true, startDate: true },
      }),
      // Versões não têm workspaceId próprio: filtram pela relação do projeto.
      this.prisma.projectVersion.findMany({
        where: { project: { workspaceId }, releasedAt: { not: null } },
        select: { id: true, version: true, releasedAt: true, projectId: true },
      }),
      this.prisma.diaryEntry.findMany({
        where: { workspaceId },
        select: { id: true, date: true, done: true },
      }),
    ]);

    const events: CalendarEvent[] = [];

    for (const p of projects) {
      if (p.deadline) {
        events.push({
          type: 'project-deadline',
          date: asDay(p.deadline),
          title: p.name,
          url: `/projetos/${p.id}`,
          entityId: p.id,
        });
      }
      if (p.startDate) {
        events.push({
          type: 'project-start',
          date: asDay(p.startDate),
          title: p.name,
          url: `/projetos/${p.id}`,
          entityId: p.id,
        });
      }
    }

    for (const s of studies) {
      if (s.startDate) {
        events.push({
          type: 'study-start',
          date: asDay(s.startDate),
          title: s.name,
          url: `/estudos/${s.id}`,
          entityId: s.id,
        });
      }
    }

    for (const v of versions) {
      if (v.releasedAt) {
        events.push({
          type: 'version',
          date: asDay(v.releasedAt),
          title: `v${v.version}`,
          url: `/projetos/${v.projectId}/versoes`,
          entityId: v.id,
        });
      }
    }

    for (const d of diary) {
      events.push({
        type: 'diary',
        date: asDay(d.date),
        title: d.done.trim().slice(0, 60) || 'Registro do diário',
        url: '/diario',
        entityId: d.id,
      });
    }

    return events;
  }
}
