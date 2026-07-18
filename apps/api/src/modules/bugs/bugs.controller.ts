import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Bugs, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/bugs. Opera no workspace ativo.
 */
@Controller('projects/:projectId/bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.bugsService.findAllByProject(projectId, workspaceId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateBugDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.bugsService.create(projectId, dto, workspaceId);
  }

  @Patch(':bugId')
  update(
    @Param('projectId') projectId: string,
    @Param('bugId') bugId: string,
    @Body() dto: UpdateBugDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.bugsService.update(projectId, bugId, dto, workspaceId);
  }

  @Delete(':bugId')
  remove(
    @Param('projectId') projectId: string,
    @Param('bugId') bugId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.bugsService.remove(projectId, bugId, workspaceId);
  }
}
