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
 * Toda consulta é escopada por `workspaceId` (multi-tenant): `Project` é a
 * entidade-raiz e possui a coluna; os objetivos escopam via o projeto pai.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: projectInclude,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      include: projectInclude,
    });
    if (!project) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
    return project;
  }

  create(dto: CreateProjectDto, workspaceId: string) {
    return this.prisma.project.create({
      data: { ...dto, workspaceId },
      include: projectInclude,
    });
  }

  async update(id: string, dto: UpdateProjectDto, workspaceId: string) {
    await this.ensureProject(id, workspaceId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: projectInclude,
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.ensureProject(id, workspaceId);
    // Objetivos removidos em cascata (onDelete: Cascade).
    return this.prisma.project.delete({ where: { id } });
  }

  // ─── Objetivos (checklist) ─────────────────────────────────────────────────

  async addObjective(
    projectId: string,
    dto: CreateObjectiveDto,
    workspaceId: string,
  ) {
    await this.ensureProject(projectId, workspaceId);
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
    workspaceId: string,
  ) {
    await this.ensureObjective(projectId, objectiveId, workspaceId);
    return this.prisma.projectObjective.update({
      where: { id: objectiveId },
      data: dto,
    });
  }

  async removeObjective(
    projectId: string,
    objectiveId: string,
    workspaceId: string,
  ) {
    await this.ensureObjective(projectId, objectiveId, workspaceId);
    return this.prisma.projectObjective.delete({ where: { id: objectiveId } });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async ensureProject(id: string, workspaceId: string): Promise<void> {
    const exists = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }

  private async ensureObjective(
    projectId: string,
    objectiveId: string,
    workspaceId: string,
  ): Promise<void> {
    // Garante que o projeto pai pertence ao workspace ativo antes de checar o objetivo.
    await this.ensureProject(projectId, workspaceId);
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
