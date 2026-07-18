import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';

/** Regras de acesso a dados do sub-módulo Versionamento. */
@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string, workspaceId: string) {
    // Mais recentes primeiro (por data de lançamento e, depois, criação).
    // Escopa via projeto pai: só lista versões de projeto do workspace ativo.
    return this.prisma.projectVersion.findMany({
      where: { projectId, project: { workspaceId } },
      orderBy: [{ releasedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(projectId: string, dto: CreateVersionDto, workspaceId: string) {
    await this.ensureProject(projectId, workspaceId);
    return this.prisma.projectVersion.create({
      data: { ...dto, projectId },
    });
  }

  async update(
    projectId: string,
    versionId: string,
    dto: UpdateVersionDto,
    workspaceId: string,
  ) {
    await this.ensureVersion(projectId, versionId, workspaceId);
    return this.prisma.projectVersion.update({
      where: { id: versionId },
      data: dto,
    });
  }

  async remove(projectId: string, versionId: string, workspaceId: string) {
    const version = await this.ensureVersion(projectId, versionId, workspaceId);
    await this.prisma.projectVersion.delete({ where: { id: versionId } });
    return version;
  }

  private async ensureProject(id: string, workspaceId: string): Promise<void> {
    // Garante que o projeto pai pertence ao workspace ativo.
    const exists = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }

  private async ensureVersion(
    projectId: string,
    versionId: string,
    workspaceId: string,
  ) {
    // Só encontra a versão se ela pertence a projeto do workspace ativo.
    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId, project: { workspaceId } },
    });
    if (!version) {
      throw new NotFoundException(
        `Versão ${versionId} não encontrada no projeto ${projectId}`,
      );
    }
    return version;
  }
}
