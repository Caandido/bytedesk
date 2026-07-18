import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKnownErrorDto, UpdateKnownErrorDto } from './dto/error.dto';

/** Regras de acesso a dados do módulo Banco de Erros. */
@Injectable()
export class ErrorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.knownError.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const error = await this.prisma.knownError.findUnique({ where: { id } });
    if (!error) {
      throw new NotFoundException(`Erro ${id} não encontrado`);
    }
    return error;
  }

  create(dto: CreateKnownErrorDto) {
    return this.prisma.knownError.create({ data: dto });
  }

  async update(id: string, dto: UpdateKnownErrorDto) {
    await this.findOne(id);
    return this.prisma.knownError.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.knownError.delete({ where: { id } });
  }
}
