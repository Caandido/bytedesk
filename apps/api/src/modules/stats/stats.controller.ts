import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { WorkspaceId } from '../auth/auth.decorators';

/** Métricas agregadas. Rota final em /api/stats. */
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getData(@WorkspaceId() workspaceId: string) {
    return this.statsService.getData(workspaceId);
  }
}
