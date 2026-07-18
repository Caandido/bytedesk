import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';

/** Regras de acesso a dados do sub-módulo Versionamento. */
@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string) {
    // Mais recentes primeiro (por data de lançamento e, depois, criação).
    return this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: [{ releasedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(projectId: string, dto: CreateVersionDto) {
    await this.ensureProject(projectId);
    return this.prisma.projectVersion.create({
      data: { ...dto, projectId },
    });
  }

  async update(projectId: string, versionId: string, dto: UpdateVersionDto) {
    await this.ensureVersion(projectId, versionId);
    return this.prisma.projectVersion.update({
      where: { id: versionId },
      data: dto,
    });
  }

  async remove(projectId: string, versionId: string) {
    const version = await this.ensureVersion(projectId, versionId);
    await this.prisma.projectVersion.delete({ where: { id: versionId } });
    return version;
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

  private async ensureVersion(projectId: string, versionId: string) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.projectId !== projectId) {
      throw new NotFoundException(
        `Versão ${versionId} não encontrada no projeto ${projectId}`,
      );
    }
    return version;
  }
}
