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
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Versionamento, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/versions.
 */
@Controller('projects/:projectId/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.versionsService.findAllByProject(projectId, workspaceId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateVersionDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.versionsService.create(projectId, dto, workspaceId);
  }

  @Patch(':versionId')
  update(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.versionsService.update(projectId, versionId, dto, workspaceId);
  }

  @Delete(':versionId')
  remove(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.versionsService.remove(projectId, versionId, workspaceId);
  }
}
