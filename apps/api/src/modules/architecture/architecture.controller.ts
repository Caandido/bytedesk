import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ArchitectureService } from './architecture.service';
import { UpdateArchitectureDto } from './dto/architecture.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Arquitetura, aninhada sob o projeto (registro 1-1).
 * Rotas finais em /api/projects/:projectId/architecture.
 */
@Controller('projects/:projectId/architecture')
export class ArchitectureController {
  constructor(private readonly architectureService: ArchitectureService) {}

  @Get()
  get(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.architectureService.get(projectId, workspaceId);
  }

  @Patch()
  upsert(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateArchitectureDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.architectureService.upsert(projectId, dto, workspaceId);
  }
}
