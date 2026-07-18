import { Controller, Get } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { WorkspaceId } from '../auth/auth.decorators';

/** Eventos datados agregados. Rota final em /api/calendar. */
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getEvents(@WorkspaceId() workspaceId: string) {
    return this.calendarService.getEvents(workspaceId);
  }
}
