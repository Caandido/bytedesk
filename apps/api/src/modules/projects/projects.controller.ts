import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateObjectiveDto,
  UpdateObjectiveDto,
} from './dto/project.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do módulo Projetos. CRUD do projeto + sub-recurso de objetivos (checklist da
 * visão geral). Rotas finais em /api/projects (prefixo global aplicado no app.factory).
 * Toda rota opera no workspace ativo (`@WorkspaceId()`).
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.projectsService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @WorkspaceId() workspaceId: string) {
    return this.projectsService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.projectsService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.projectsService.remove(id, workspaceId);
  }

  // ─── Objetivos ───────────────────────────────────────────────────────────

  @Post(':id/objectives')
  addObjective(
    @Param('id') id: string,
    @Body() dto: CreateObjectiveDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.projectsService.addObjective(id, dto, workspaceId);
  }

  @Patch(':id/objectives/:objectiveId')
  updateObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @Body() dto: UpdateObjectiveDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.projectsService.updateObjective(
      id,
      objectiveId,
      dto,
      workspaceId,
    );
  }

  @Delete(':id/objectives/:objectiveId')
  removeObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.projectsService.removeObjective(id, objectiveId, workspaceId);
  }
}
