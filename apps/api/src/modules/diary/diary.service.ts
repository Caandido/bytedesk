import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DiaryEntry } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary.dto';

/** Traz o nome do projeto associado (se houver). */
const include = {
  project: { select: { name: true } },
} satisfies Prisma.DiaryEntryInclude;

type EntryWithProject = Prisma.DiaryEntryGetPayload<{ include: typeof include }>;

/** Achata a entidade do Prisma para o formato do contrato (projectName no topo). */
function toDto(entry: EntryWithProject): DiaryEntry {
  const { project, ...rest } = entry;
  return { ...rest, projectName: project?.name ?? null };
}

/** Regras de acesso a dados do Diário de Desenvolvimento. */
@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string): Promise<DiaryEntry[]> {
    const entries = await this.prisma.diaryEntry.findMany({
      where: { workspaceId },
      orderBy: { date: 'desc' },
      include,
    });
    return entries.map(toDto);
  }

  async create(
    dto: CreateDiaryEntryDto,
    workspaceId: string,
  ): Promise<DiaryEntry> {
    // Omite `projectId` quando vazio para não colidir com o tipo esperado pelo
    // Prisma — entrada sem projeto continua permitida.
    const { projectId, ...rest } = dto;
    const data: Prisma.DiaryEntryUncheckedCreateInput = {
      ...rest,
      workspaceId,
      ...(projectId ? { projectId } : {}),
    };
    const entry = await this.prisma.diaryEntry.create({ data, include });
    return toDto(entry);
  }

  async update(
    id: string,
    dto: UpdateDiaryEntryDto,
    workspaceId: string,
  ): Promise<DiaryEntry> {
    await this.ensure(id, workspaceId);
    const entry = await this.prisma.diaryEntry.update({
      where: { id },
      data: dto,
      include,
    });
    return toDto(entry);
  }

  async remove(id: string, workspaceId: string): Promise<DiaryEntry> {
    const entry = await this.ensure(id, workspaceId);
    await this.prisma.diaryEntry.delete({ where: { id } });
    return toDto(entry);
  }

  private async ensure(
    id: string,
    workspaceId: string,
  ): Promise<EntryWithProject> {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id, workspaceId },
      include,
    });
    if (!entry) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    return entry;
  }
}
