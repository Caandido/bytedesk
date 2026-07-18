import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';

/**
 * Regras de acesso a dados do sub-módulo Bugs. Mesmo padrão dos demais services:
 * `ensureProject`/`ensureBug` centralizam o 404.
 */
@Injectable()
export class BugsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string) {
    return this.prisma.bug.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateBugDto) {
    await this.ensureProject(projectId);
    return this.prisma.bug.create({ data: { ...dto, projectId } });
  }

  async update(projectId: string, bugId: string, dto: UpdateBugDto) {
    await this.ensureBug(projectId, bugId);
    return this.prisma.bug.update({ where: { id: bugId }, data: dto });
  }

  async remove(projectId: string, bugId: string) {
    const bug = await this.ensureBug(projectId, bugId);
    await this.prisma.bug.delete({ where: { id: bugId } });
    return bug;
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

  private async ensureBug(projectId: string, bugId: string) {
    const bug = await this.prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug || bug.projectId !== projectId) {
      throw new NotFoundException(
        `Bug ${bugId} não encontrado no projeto ${projectId}`,
      );
    }
    return bug;
  }
}
