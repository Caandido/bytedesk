import { Controller, Get } from '@nestjs/common';
import { CalendarService } from './calendar.service';

/** Eventos datados agregados. Rota final em /api/calendar. */
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getEvents() {
    return this.calendarService.getEvents();
  }
}
