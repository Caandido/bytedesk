import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateObjectiveDto,
  UpdateObjectiveDto,
} from './dto/project.dto';

/** Sempre trazemos os objetivos ordenados junto do projeto. */
const projectInclude = {
  objectives: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProjectInclude;

/**
 * Regras de acesso a dados do módulo Projetos. Mesmo padrão do StudiesService:
 * `ensureProject`/`ensureObjective` centralizam o 404 e os métodos ficam finos.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: projectInclude,
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
    if (!project) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: dto,
      include: projectInclude,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureProject(id);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: projectInclude,
    });
  }

  async remove(id: string) {
    await this.ensureProject(id);
    // Objetivos removidos em cascata (onDelete: Cascade).
    return this.prisma.project.delete({ where: { id } });
  }

  // ─── Objetivos (checklist) ─────────────────────────────────────────────────

  async addObjective(projectId: string, dto: CreateObjectiveDto) {
    await this.ensureProject(projectId);
    const count = await this.prisma.projectObjective.count({
      where: { projectId },
    });
    return this.prisma.projectObjective.create({
      data: { projectId, title: dto.title, position: count },
    });
  }

  async updateObjective(
    projectId: string,
    objectiveId: string,
    dto: UpdateObjectiveDto,
  ) {
    await this.ensureObjective(projectId, objectiveId);
    return this.prisma.projectObjective.update({
      where: { id: objectiveId },
      data: dto,
    });
  }

  async removeObjective(projectId: string, objectiveId: string) {
    await this.ensureObjective(projectId, objectiveId);
    return this.prisma.projectObjective.delete({ where: { id: objectiveId } });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async ensureProject(id: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }

  private async ensureObjective(
    projectId: string,
    objectiveId: string,
  ): Promise<void> {
    const objective = await this.prisma.projectObjective.findUnique({
      where: { id: objectiveId },
      select: { projectId: true },
    });
    if (!objective || objective.projectId !== projectId) {
      throw new NotFoundException(
        `Objetivo ${objectiveId} não encontrado no projeto ${projectId}`,
      );
    }
  }
}
