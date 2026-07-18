import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIdeaDto, UpdateIdeaDto } from './dto/idea.dto';

/** Regras de acesso a dados do sub-módulo Banco de Ideias. */
@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string, workspaceId: string) {
    // Escopa via projeto pai: só lista ideias de projeto do workspace ativo.
    return this.prisma.idea.findMany({
      where: { projectId, project: { workspaceId } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateIdeaDto, workspaceId: string) {
    await this.ensureProject(projectId, workspaceId);
    return this.prisma.idea.create({ data: { ...dto, projectId } });
  }

  async update(
    projectId: string,
    ideaId: string,
    dto: UpdateIdeaDto,
    workspaceId: string,
  ) {
    await this.ensureIdea(projectId, ideaId, workspaceId);
    return this.prisma.idea.update({ where: { id: ideaId }, data: dto });
  }

  async remove(projectId: string, ideaId: string, workspaceId: string) {
    const idea = await this.ensureIdea(projectId, ideaId, workspaceId);
    await this.prisma.idea.delete({ where: { id: ideaId } });
    return idea;
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

  private async ensureIdea(
    projectId: string,
    ideaId: string,
    workspaceId: string,
  ) {
    // Só encontra a ideia se ela pertence a projeto do workspace ativo.
    const idea = await this.prisma.idea.findFirst({
      where: { id: ideaId, projectId, project: { workspaceId } },
    });
    if (!idea) {
      throw new NotFoundException(
        `Ideia ${ideaId} não encontrada no projeto ${projectId}`,
      );
    }
    return idea;
  }
}
