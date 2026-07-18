import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ProjectArchitecture } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateArchitectureDto } from './dto/architecture.dto';

/**
 * Regras de acesso à arquitetura de um projeto (registro 1-1). O GET devolve
 * defaults vazios se ainda não houver registro; o PATCH faz upsert.
 */
@Injectable()
export class ArchitectureService {
  constructor(private readonly prisma: PrismaService) {}

  async get(projectId: string): Promise<ProjectArchitecture> {
    await this.ensureProject(projectId);
    const arch = await this.prisma.projectArchitecture.findUnique({
      where: { projectId },
    });
    return {
      projectId,
      content: arch?.content ?? '',
      folderStructure: arch?.folderStructure ?? '',
      dependencies: (arch?.dependencies as ProjectArchitecture['dependencies']) ?? [],
    };
  }

  async upsert(
    projectId: string,
    dto: UpdateArchitectureDto,
  ): Promise<ProjectArchitecture> {
    await this.ensureProject(projectId);

    const data: Prisma.ProjectArchitectureUncheckedUpdateInput &
      Prisma.ProjectArchitectureUncheckedCreateInput = { projectId };
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.folderStructure !== undefined) {
      data.folderStructure = dto.folderStructure;
    }
    if (dto.dependencies !== undefined) {
      data.dependencies = dto.dependencies as unknown as Prisma.InputJsonValue;
    }

    const arch = await this.prisma.projectArchitecture.upsert({
      where: { projectId },
      create: data,
      update: data,
    });
    return {
      projectId,
      content: arch.content,
      folderStructure: arch.folderStructure,
      dependencies: arch.dependencies as ProjectArchitecture['dependencies'],
    };
  }

  private async ensureProject(id: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }
}
