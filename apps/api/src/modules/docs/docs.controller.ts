import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DocsService } from './docs.service';
import { CreateDocDto, UpdateDocDto } from './dto/doc.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Documentação, aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/docs.
 */
@Controller('projects/:projectId/docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.docsService.findAllByProject(projectId, workspaceId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.docsService.create(projectId, dto, workspaceId);
  }

  @Patch(':docId')
  update(
    @Param('projectId') projectId: string,
    @Param('docId') docId: string,
    @Body() dto: UpdateDocDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.docsService.update(projectId, docId, dto, workspaceId);
  }

  @Delete(':docId')
  remove(
    @Param('projectId') projectId: string,
    @Param('docId') docId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.docsService.remove(projectId, docId, workspaceId);
  }
}
