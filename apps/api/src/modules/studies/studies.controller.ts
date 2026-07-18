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

/**
 * API do módulo Estudos. CRUD do estudo + sub-recurso de objetivos (checklist).
 * Prefixo global "/api" é aplicado no app.factory → rotas finais em /api/studies.
 */
@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Get()
  findAll() {
    return this.studiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStudyDto) {
    return this.studiesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudyDto) {
    return this.studiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studiesService.remove(id);
  }

  // ─── Objetivos ───────────────────────────────────────────────────────────

  @Post(':id/objectives')
  addObjective(@Param('id') id: string, @Body() dto: CreateObjectiveDto) {
    return this.studiesService.addObjective(id, dto);
  }

  @Patch(':id/objectives/:objectiveId')
  updateObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
    @Body() dto: UpdateObjectiveDto,
  ) {
    return this.studiesService.updateObjective(id, objectiveId, dto);
  }

  @Delete(':id/objectives/:objectiveId')
  removeObjective(
    @Param('id') id: string,
    @Param('objectiveId') objectiveId: string,
  ) {
    return this.studiesService.removeObjective(id, objectiveId);
  }

  // ─── Seções ──────────────────────────────────────────────────────────────

  @Post(':id/sections')
  addSection(@Param('id') id: string, @Body() dto: CreateSectionDto) {
    return this.studiesService.addSection(id, dto);
  }

  @Patch(':id/sections/:sectionId')
  updateSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.studiesService.updateSection(id, sectionId, dto);
  }

  @Delete(':id/sections/:sectionId')
  removeSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.studiesService.removeSection(id, sectionId);
  }
}
