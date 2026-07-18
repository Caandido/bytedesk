import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

/** Dados agregados da tela inicial. Rota final em /api/dashboard. */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getData() {
    return this.dashboardService.getData();
  }
}
