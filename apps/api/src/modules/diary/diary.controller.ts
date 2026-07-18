import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/** API do Diário de Desenvolvimento. Rotas finais em /api/diary. */
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.diaryService.findAll(workspaceId);
  }

  @Post()
  create(
    @Body() dto: CreateDiaryEntryDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.diaryService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiaryEntryDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.diaryService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.diaryService.remove(id, workspaceId);
  }
}
