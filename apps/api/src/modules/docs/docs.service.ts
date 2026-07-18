import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocDto, UpdateDocDto } from './dto/doc.dto';

/** Regras de acesso a dados do sub-módulo Documentação (páginas Markdown). */
@Injectable()
export class DocsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string) {
    return this.prisma.projectDoc.findMany({
      where: { projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(projectId: string, dto: CreateDocDto) {
    await this.ensureProject(projectId);
    const count = await this.prisma.projectDoc.count({ where: { projectId } });
    return this.prisma.projectDoc.create({
      data: { ...dto, projectId, position: count },
    });
  }

  async update(projectId: string, docId: string, dto: UpdateDocDto) {
    await this.ensureDoc(projectId, docId);
    return this.prisma.projectDoc.update({ where: { id: docId }, data: dto });
  }

  async remove(projectId: string, docId: string) {
    const doc = await this.ensureDoc(projectId, docId);
    await this.prisma.projectDoc.delete({ where: { id: docId } });
    return doc;
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

  private async ensureDoc(projectId: string, docId: string) {
    const doc = await this.prisma.projectDoc.findUnique({
      where: { id: docId },
    });
    if (!doc || doc.projectId !== projectId) {
      throw new NotFoundException(
        `Página ${docId} não encontrada no projeto ${projectId}`,
      );
    }
    return doc;
  }
}
