import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ArchitectureService } from './architecture.service';
import { UpdateArchitectureDto } from './dto/architecture.dto';

/**
 * API do sub-módulo Arquitetura, aninhada sob o projeto (registro 1-1).
 * Rotas finais em /api/projects/:projectId/architecture.
 */
@Controller('projects/:projectId/architecture')
export class ArchitectureController {
  constructor(private readonly architectureService: ArchitectureService) {}

  @Get()
  get(@Param('projectId') projectId: string) {
    return this.architectureService.get(projectId);
  }

  @Patch()
  upsert(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateArchitectureDto,
  ) {
    return this.architectureService.upsert(projectId, dto);
  }
}
