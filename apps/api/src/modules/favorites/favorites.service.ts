import { Injectable } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/favorite.dto';

/** Regras de acesso a dados dos Favoritos transversais. */
@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.favorite.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Favoritar (idempotente por type+entityId). */
  create(dto: CreateFavoriteDto) {
    return this.prisma.favorite.upsert({
      where: { type_entityId: { type: dto.type, entityId: dto.entityId } },
      create: dto,
      update: {
        title: dto.title,
        subtitle: dto.subtitle,
        url: dto.url,
      },
    });
  }

  /** Remover o favorito (se existir). */
  async remove(type: FavoriteType, entityId: string) {
    await this.prisma.favorite.deleteMany({ where: { type, entityId } });
    return { type, entityId };
  }
}
