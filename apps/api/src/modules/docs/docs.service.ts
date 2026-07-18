import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocDto, UpdateDocDto } from './dto/doc.dto';

/** Regras de acesso a dados do sub-módulo Documentação (páginas Markdown). */
@Injectable()
export class DocsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string, workspaceId: string) {
    // Escopa via projeto pai: só lista páginas de projeto do workspace ativo.
    return this.prisma.projectDoc.findMany({
      where: { projectId, project: { workspaceId } },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(projectId: string, dto: CreateDocDto, workspaceId: string) {
    await this.ensureProject(projectId, workspaceId);
    const count = await this.prisma.projectDoc.count({ where: { projectId } });
    return this.prisma.projectDoc.create({
      data: { ...dto, projectId, position: count },
    });
  }

  async update(
    projectId: string,
    docId: string,
    dto: UpdateDocDto,
    workspaceId: string,
  ) {
    await this.ensureDoc(projectId, docId, workspaceId);
    return this.prisma.projectDoc.update({ where: { id: docId }, data: dto });
  }

  async remove(projectId: string, docId: string, workspaceId: string) {
    const doc = await this.ensureDoc(projectId, docId, workspaceId);
    await this.prisma.projectDoc.delete({ where: { id: docId } });
    return doc;
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

  private async ensureDoc(
    projectId: string,
    docId: string,
    workspaceId: string,
  ) {
    // Só encontra a página se ela pertence a projeto do workspace ativo.
    const doc = await this.prisma.projectDoc.findFirst({
      where: { id: docId, projectId, project: { workspaceId } },
    });
    if (!doc) {
      throw new NotFoundException(
        `Página ${docId} não encontrada no projeto ${projectId}`,
      );
    }
    return doc;
  }
}
