import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StudiesService } from './studies.service';
import {
  CreateStudyDto,
  UpdateStudyDto,
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateSectionDto,
  UpdateSectionDto,
} from './dto/study.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do módulo Estudos. CRUD do estudo + sub-recurso de objetivos (checklist).
 * Prefixo global "/api" é aplicado no app.factory → rotas finais em /api/studies.
 * Toda rota opera no workspace ativo (`@WorkspaceId()`).
 */
@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.studiesService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.studiesService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateStudyDto, @WorkspaceId() workspaceId: string) {
    return this.studiesService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudyDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.studiesService.remove(id, workspaceId);
  }

  // ─── Objetivos ───────────────────────────────────────────────────────────

  @Post(':id/objectives')
  addObjective(
    @Param('id') id: string,
    @Body() dto: CreateObjectiveDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.addObjective(id, dto, workspaceId);
  }

  @Patch(':id/objectives/:objectiveId')
  updateObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @Body() dto: UpdateObjectiveDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.updateObjective(id, objectiveId, dto, workspaceId);
  }

  @Delete(':id/objectives/:objectiveId')
  removeObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.removeObjective(id, objectiveId, workspaceId);
  }

  // ─── Seções ──────────────────────────────────────────────────────────────

  @Post(':id/sections')
  addSection(
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.addSection(id, dto, workspaceId);
  }

  @Patch(':id/sections/:sectionId')
  updateSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.updateSection(id, sectionId, dto, workspaceId);
  }

  @Delete(':id/sections/:sectionId')
  removeSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.studiesService.removeSection(id, sectionId, workspaceId);
  }
}
