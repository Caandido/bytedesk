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
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Banco de Ideias, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/ideas.
 */
@Controller('projects/:projectId/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.ideasService.findAllByProject(projectId, workspaceId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIdeaDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.ideasService.create(projectId, dto, workspaceId);
  }

  @Patch(':ideaId')
  update(
    @Param('projectId') projectId: string,
    @Param('ideaId') ideaId: string,
    @Body() dto: UpdateIdeaDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.ideasService.update(projectId, ideaId, dto, workspaceId);
  }

  @Delete(':ideaId')
  remove(
    @Param('projectId') projectId: string,
    @Param('ideaId') ideaId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.ideasService.remove(projectId, ideaId, workspaceId);
  }
}
