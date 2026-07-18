import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudyDto,
  UpdateStudyDto,
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateSectionDto,
  UpdateSectionDto,
} from './dto/study.dto';

/** Sempre trazemos objetivos e seções ordenados junto do estudo. */
const studyInclude = {
  objectives: { orderBy: { position: 'asc' } },
  sections: { orderBy: { position: 'asc' } },
} satisfies Prisma.StudyInclude;

/**
 * Regras de acesso a dados do módulo Estudos. Espelha o padrão do NotesService:
 * `ensureStudy`/`ensureObjective` centralizam o 404, e os métodos permanecem finos.
 */
@Injectable()
export class StudiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.study.findMany({
      orderBy: { updatedAt: 'desc' },
      include: studyInclude,
    });
  }

  async findOne(id: string) {
    const study = await this.prisma.study.findUnique({
      where: { id },
      include: studyInclude,
    });
    if (!study) {
      throw new NotFoundException(`Estudo ${id} não encontrado`);
    }
    return study;
  }

  create(dto: CreateStudyDto) {
    // O CreateStudyDto garante `name`, logo o cast para o input de create é seguro.
    return this.prisma.study.create({
      data: this.toStudyData(dto) as Prisma.StudyUncheckedCreateInput,
      include: studyInclude,
    });
  }

  async update(id: string, dto: UpdateStudyDto) {
    await this.ensureStudy(id);
    return this.prisma.study.update({
      where: { id },
      data: this.toStudyData(dto),
      include: studyInclude,
    });
  }

  async remove(id: string) {
    await this.ensureStudy(id);
    // Os objetivos são removidos em cascata (onDelete: Cascade).
    return this.prisma.study.delete({ where: { id } });
  }

  // ─── Objetivos (checklist) ─────────────────────────────────────────────────

  async addObjective(studyId: string, dto: CreateObjectiveDto) {
    await this.ensureStudy(studyId);
    const count = await this.prisma.studyObjective.count({ where: { studyId } });
    return this.prisma.studyObjective.create({
      data: { studyId, title: dto.title, position: count },
    });
  }

  async updateObjective(
    studyId: string,
    objectiveId: string,
    dto: UpdateObjectiveDto,
  ) {
    await this.ensureObjective(studyId, objectiveId);
    return this.prisma.studyObjective.update({
      where: { id: objectiveId },
      data: dto,
    });
  }

  async removeObjective(studyId: string, objectiveId: string) {
    await this.ensureObjective(studyId, objectiveId);
    return this.prisma.studyObjective.delete({ where: { id: objectiveId } });
  }

  // ─── Seções (cards de conteúdo) ────────────────────────────────────────────

  async addSection(studyId: string, dto: CreateSectionDto) {
    await this.ensureStudy(studyId);
    const count = await this.prisma.studySection.count({ where: { studyId } });
    return this.prisma.studySection.create({
      data: { studyId, title: dto.title, content: dto.content, position: count },
    });
  }

  async updateSection(
    studyId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    await this.ensureSection(studyId, sectionId);
    return this.prisma.studySection.update({
      where: { id: sectionId },
      data: dto,
    });
  }

  async removeSection(studyId: string, sectionId: string) {
    await this.ensureSection(studyId, sectionId);
    return this.prisma.studySection.delete({ where: { id: sectionId } });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Converte o DTO validado para o formato de dados do Prisma. Tipado como update
   * (todos os campos opcionais); no create é feito o cast, pois `name` está garantido.
   */
  private toStudyData(
    dto: CreateStudyDto | UpdateStudyDto,
  ): Prisma.StudyUncheckedUpdateInput {
    const data: Prisma.StudyUncheckedUpdateInput = { ...dto };
    // `links` é um campo Json no Prisma; o array validado é um InputJsonValue válido.
    if (dto.links !== undefined) {
      data.links = dto.links as Prisma.InputJsonValue;
    }
    return data;
  }

  private async ensureStudy(id: string): Promise<void> {
    const exists = await this.prisma.study.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Estudo ${id} não encontrado`);
    }
  }

  private async ensureObjective(
    studyId: string,
    objectiveId: string,
  ): Promise<void> {
    const objective = await this.prisma.studyObjective.findUnique({
      where: { id: objectiveId },
      select: { studyId: true },
    });
    if (!objective || objective.studyId !== studyId) {
      throw new NotFoundException(
        `Objetivo ${objectiveId} não encontrado no estudo ${studyId}`,
      );
    }
  }

  private async ensureSection(
    studyId: string,
    sectionId: string,
  ): Promise<void> {
    const section = await this.prisma.studySection.findUnique({
      where: { id: sectionId },
      select: { studyId: true },
    });
    if (!section || section.studyId !== studyId) {
      throw new NotFoundException(
        `Seção ${sectionId} não encontrada no estudo ${studyId}`,
      );
    }
  }
}
