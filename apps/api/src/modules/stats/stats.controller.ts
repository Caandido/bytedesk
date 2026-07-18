import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

/** Métricas agregadas. Rota final em /api/stats. */
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getData() {
    return this.statsService.getData();
  }
}
