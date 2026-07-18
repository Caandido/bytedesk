import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * CRUD da entidade-exemplo `Note`. Toda rota exige token (guard global) e opera no
 * workspace ativo (`@WorkspaceId()`) — serve de referência de padrão de controller.
 */
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.notesService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.notesService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateNoteDto, @WorkspaceId() workspaceId: string) {
    return this.notesService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.notesService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.notesService.remove(id, workspaceId);
  }
}
