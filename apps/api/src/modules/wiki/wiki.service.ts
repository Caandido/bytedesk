import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWikiPageDto, UpdateWikiPageDto } from './dto/wiki.dto';

/** Regras de acesso a dados do módulo Conhecimento (wiki pessoal). */
@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // Favoritas primeiro, depois as mais recentes.
    return this.prisma.wikiPage.findMany({
      orderBy: [{ favorite: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.wikiPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Página ${id} não encontrada`);
    }
    return page;
  }

  create(dto: CreateWikiPageDto) {
    return this.prisma.wikiPage.create({ data: dto });
  }

  async update(id: string, dto: UpdateWikiPageDto) {
    await this.findOne(id);
    return this.prisma.wikiPage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.wikiPage.delete({ where: { id } });
  }
}
