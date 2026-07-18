import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';

/**
 * API do sub-módulo Versionamento, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/versions.
 */
@Controller('projects/:projectId/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.versionsService.findAllByProject(projectId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionsService.create(projectId, dto);
  }

  @Patch(':versionId')
  update(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.versionsService.update(projectId, versionId, dto);
  }

  @Delete(':versionId')
  remove(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.remove(projectId, versionId);
  }
}
