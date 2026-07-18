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
import { WorkspaceId } from '../auth/auth.decorators';

/** API do módulo Conhecimento (wiki). Rotas finais em /api/wiki. */
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.wikiService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.wikiService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateWikiPageDto, @WorkspaceId() workspaceId: string) {
    return this.wikiService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWikiPageDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.wikiService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.wikiService.remove(id, workspaceId);
  }
}
