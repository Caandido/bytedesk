import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';

/**
 * API do sub-módulo Bugs, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/bugs.
 */
@Controller('projects/:projectId/bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.bugsService.findAllByProject(projectId);
  }

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateBugDto) {
    return this.bugsService.create(projectId, dto);
  }

  @Patch(':bugId')
  update(
    @Param('projectId') projectId: string,
    @Param('bugId') bugId: string,
    @Body() dto: UpdateBugDto,
  ) {
    return this.bugsService.update(projectId, bugId, dto);
  }

  @Delete(':bugId')
  remove(
    @Param('projectId') projectId: string,
    @Param('bugId') bugId: string,
  ) {
    return this.bugsService.remove(projectId, bugId);
  }
}
