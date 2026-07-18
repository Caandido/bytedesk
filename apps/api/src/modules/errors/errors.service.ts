import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKnownErrorDto, UpdateKnownErrorDto } from './dto/error.dto';

/** Regras de acesso a dados do módulo Banco de Erros. */
@Injectable()
export class ErrorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    return this.prisma.knownError.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const error = await this.prisma.knownError.findFirst({
      where: { id, workspaceId },
    });
    if (!error) {
      throw new NotFoundException(`Erro ${id} não encontrado`);
    }
    return error;
  }

  create(dto: CreateKnownErrorDto, workspaceId: string) {
    return this.prisma.knownError.create({ data: { ...dto, workspaceId } });
  }

  async update(id: string, dto: UpdateKnownErrorDto, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.knownError.update({ where: { id }, data: dto });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.knownError.delete({ where: { id } });
  }
}
