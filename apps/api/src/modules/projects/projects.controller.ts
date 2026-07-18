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

/**
 * API do módulo Projetos. CRUD do projeto + sub-recurso de objetivos (checklist da
 * visão geral). Rotas finais em /api/projects (prefixo global aplicado no app.factory).
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // ─── Objetivos ───────────────────────────────────────────────────────────

  @Post(':id/objectives')
  addObjective(@Param('id') id: string, @Body() dto: CreateObjectiveDto) {
    return this.projectsService.addObjective(id, dto);
  }

  @Patch(':id/objectives/:objectiveId')
  updateObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @Body() dto: UpdateObjectiveDto,
  ) {
    return this.projectsService.updateObjective(id, objectiveId, dto);
  }

  @Delete(':id/objectives/:objectiveId')
  removeObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
  ) {
    return this.projectsService.removeObjective(id, objectiveId);
  }
}
