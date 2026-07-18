import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/favorite.dto';

/** API dos Favoritos transversais. Rotas finais em /api/favorites. */
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(dto);
  }

  @Delete(':type/:entityId')
  remove(
    @Param('type') type: FavoriteType,
    @Param('entityId') entityId: string,
  ) {
    return this.favoritesService.remove(type, entityId);
  }
}
