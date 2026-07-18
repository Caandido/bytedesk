import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWikiPageDto, UpdateWikiPageDto } from './dto/wiki.dto';

/** Regras de acesso a dados do módulo Conhecimento (wiki pessoal). */
@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    // Favoritas primeiro, depois as mais recentes.
    return this.prisma.wikiPage.findMany({
      where: { workspaceId },
      orderBy: [{ favorite: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string, workspaceId: string) {
    const page = await this.prisma.wikiPage.findFirst({
      where: { id, workspaceId },
    });
    if (!page) {
      throw new NotFoundException(`Página ${id} não encontrada`);
    }
    return page;
  }

  create(dto: CreateWikiPageDto, workspaceId: string) {
    return this.prisma.wikiPage.create({ data: { ...dto, workspaceId } });
  }

  async update(id: string, dto: UpdateWikiPageDto, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.wikiPage.update({ where: { id }, data: dto });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.wikiPage.delete({ where: { id } });
  }
}
