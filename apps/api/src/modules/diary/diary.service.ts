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

  async findAll(): Promise<DiaryEntry[]> {
    const entries = await this.prisma.diaryEntry.findMany({
      orderBy: { date: 'desc' },
      include,
    });
    return entries.map(toDto);
  }

  async create(dto: CreateDiaryEntryDto): Promise<DiaryEntry> {
    const entry = await this.prisma.diaryEntry.create({ data: dto, include });
    return toDto(entry);
  }

  async update(id: string, dto: UpdateDiaryEntryDto): Promise<DiaryEntry> {
    await this.ensure(id);
    const entry = await this.prisma.diaryEntry.update({
      where: { id },
      data: dto,
      include,
    });
    return toDto(entry);
  }

  async remove(id: string): Promise<DiaryEntry> {
    const entry = await this.ensure(id);
    await this.prisma.diaryEntry.delete({ where: { id } });
    return toDto(entry);
  }

  private async ensure(id: string): Promise<EntryWithProject> {
    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id },
      include,
    });
    if (!entry) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    return entry;
  }
}
