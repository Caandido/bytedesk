import { Injectable, NotFoundException } from '@nestjs/common';
import type { Note } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

/**
 * Regras de acesso a dados da entidade-exemplo `Note`.
 * Serve de referência de padrão para os services dos módulos reais.
 */
@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Note[]> {
    return this.prisma.note.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Nota ${id} não encontrada`);
    }
    return note;
  }

  create(data: CreateNoteDto): Promise<Note> {
    return this.prisma.note.create({ data });
  }

  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    await this.findOne(id);
    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Note> {
    await this.findOne(id);
    return this.prisma.note.delete({ where: { id } });
  }
}
