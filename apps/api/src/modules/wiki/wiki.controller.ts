import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { CreateWikiPageDto, UpdateWikiPageDto } from './dto/wiki.dto';

/** API do módulo Conhecimento (wiki). Rotas finais em /api/wiki. */
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get()
  findAll() {
    return this.wikiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wikiService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWikiPageDto) {
    return this.wikiService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWikiPageDto) {
    return this.wikiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wikiService.remove(id);
  }
}
