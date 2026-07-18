import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto } from './dto/idea.dto';

/**
 * API do sub-módulo Banco de Ideias, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/ideas.
 */
@Controller('projects/:projectId/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.ideasService.findAllByProject(projectId);
  }

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateIdeaDto) {
    return this.ideasService.create(projectId, dto);
  }

  @Patch(':ideaId')
  update(
    @Param('projectId') projectId: string,
    @Param('ideaId') ideaId: string,
    @Body() dto: UpdateIdeaDto,
  ) {
    return this.ideasService.update(projectId, ideaId, dto);
  }

  @Delete(':ideaId')
  remove(
    @Param('projectId') projectId: string,
    @Param('ideaId') ideaId: string,
  ) {
    return this.ideasService.remove(projectId, ideaId);
  }
}
