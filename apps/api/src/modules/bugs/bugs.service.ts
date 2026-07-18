import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';

/**
 * Regras de acesso a dados do sub-módulo Bugs. Mesmo padrão dos demais services:
 * `ensureProject`/`ensureBug` centralizam o 404.
 *
 * `Bug` é filho de `Project` e não possui `workspaceId` própria: o escopo
 * multi-tenant é aplicado sempre VIA o projeto pai (`project: { workspaceId }`).
 */
@Injectable()
export class BugsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string, workspaceId: string) {
    return this.prisma.bug.findMany({
      where: { projectId, project: { workspaceId } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateBugDto, workspaceId: string) {
    await this.ensureProject(projectId, workspaceId);
    return this.prisma.bug.create({ data: { ...dto, projectId } });
  }

  async update(
    projectId: string,
    bugId: string,
    dto: UpdateBugDto,
    workspaceId: string,
  ) {
    await this.ensureBug(projectId, bugId, workspaceId);
    return this.prisma.bug.update({ where: { id: bugId }, data: dto });
  }

  async remove(projectId: string, bugId: string, workspaceId: string) {
    const bug = await this.ensureBug(projectId, bugId, workspaceId);
    await this.prisma.bug.delete({ where: { id: bugId } });
    return bug;
  }

  private async ensureProject(id: string, workspaceId: string): Promise<void> {
    const exists = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }

  private async ensureBug(
    projectId: string,
    bugId: string,
    workspaceId: string,
  ) {
    // Só encontra o bug se o projeto pai pertencer ao workspace ativo.
    const bug = await this.prisma.bug.findFirst({
      where: { id: bugId, projectId, project: { workspaceId } },
    });
    if (!bug) {
      throw new NotFoundException(
        `Bug ${bugId} não encontrado no projeto ${projectId}`,
      );
    }
    return bug;
  }
}
