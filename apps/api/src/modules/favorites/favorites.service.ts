import { Injectable } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/favorite.dto';

/** Regras de acesso a dados dos Favoritos transversais. */
@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Favoritar (idempotente por userId+type+entityId). */
  create(dto: CreateFavoriteDto, userId: string) {
    return this.prisma.favorite.upsert({
      where: {
        userId_type_entityId: {
          userId,
          type: dto.type,
          entityId: dto.entityId,
        },
      },
      create: { ...dto, userId },
      update: {
        title: dto.title,
        subtitle: dto.subtitle,
        url: dto.url,
      },
    });
  }

  /** Remover o favorito do usuário (se existir). */
  async remove(type: FavoriteType, entityId: string, userId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, type, entityId } });
    return { type, entityId };
  }
}
