import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { WorkspaceId } from '../auth/auth.decorators';

/** Dados agregados da tela inicial. Rota final em /api/dashboard. */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getData(@WorkspaceId() workspaceId: string) {
    return this.dashboardService.getData(workspaceId);
  }
}
