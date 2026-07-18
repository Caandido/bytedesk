import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/favorite.dto';
import { CurrentUser } from '../auth/auth.decorators';

/** API dos Favoritos transversais (por usuário). Rotas finais em /api/favorites. */
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() userId: string) {
    return this.favoritesService.findAll(userId);
  }

  @Post()
  create(@Body() dto: CreateFavoriteDto, @CurrentUser() userId: string) {
    return this.favoritesService.create(dto, userId);
  }

  @Delete(':type/:entityId')
  remove(
    @Param('type') type: FavoriteType,
    @Param('entityId') entityId: string,
    @CurrentUser() userId: string,
  ) {
    return this.favoritesService.remove(type, entityId, userId);
  }
}
