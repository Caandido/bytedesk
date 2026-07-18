import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIdeaDto, UpdateIdeaDto } from './dto/idea.dto';

/** Regras de acesso a dados do sub-módulo Banco de Ideias. */
@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string) {
    return this.prisma.idea.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateIdeaDto) {
    await this.ensureProject(projectId);
    return this.prisma.idea.create({ data: { ...dto, projectId } });
  }

  async update(projectId: string, ideaId: string, dto: UpdateIdeaDto) {
    await this.ensureIdea(projectId, ideaId);
    return this.prisma.idea.update({ where: { id: ideaId }, data: dto });
  }

  async remove(projectId: string, ideaId: string) {
    const idea = await this.ensureIdea(projectId, ideaId);
    await this.prisma.idea.delete({ where: { id: ideaId } });
    return idea;
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

  private async ensureIdea(projectId: string, ideaId: string) {
    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea || idea.projectId !== projectId) {
      throw new NotFoundException(
        `Ideia ${ideaId} não encontrada no projeto ${projectId}`,
      );
    }
    return idea;
  }
}
