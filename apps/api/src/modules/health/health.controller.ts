import { Controller, Get } from '@nestjs/common';

/**
 * Endpoint de saúde da API. Usado pelo frontend para provar a integração front↔back.
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'devflow-api',
      timestamp: new Date().toISOString(),
    };
  }
}
