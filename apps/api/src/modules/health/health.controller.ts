import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.decorators';

/**
 * Endpoint de saúde da API. Usado pelo frontend para provar a integração front↔back.
 */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { status: 'ok'; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'devflow-api',
      timestamp: new Date().toISOString(),
    };
  }
}
