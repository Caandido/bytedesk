import { Injectable, NotFoundException } from '@nestjs/common';
import type { Note } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

/**
 * Regras de acesso a dados da entidade-exemplo `Note`.
 * Serve de referência de padrão para os services dos módulos reais — inclusive do
 * **escopo por workspace**: toda consulta é filtrada por `workspaceId`.
 */
@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<Note> {
    const note = await this.prisma.note.findFirst({
      where: { id, workspaceId },
    });
    if (!note) {
      throw new NotFoundException(`Nota ${id} não encontrada`);
    }
    return note;
  }

  create(data: CreateNoteDto, workspaceId: string): Promise<Note> {
    return this.prisma.note.create({ data: { ...data, workspaceId } });
  }

  async update(
    id: string,
    data: UpdateNoteDto,
    workspaceId: string,
  ): Promise<Note> {
    await this.findOne(id, workspaceId);
    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(id: string, workspaceId: string): Promise<Note> {
    await this.findOne(id, workspaceId);
    return this.prisma.note.delete({ where: { id } });
  }
}
