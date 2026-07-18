import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import {
  CreateRoadmapDto,
  UpdateRoadmapDto,
  CreateRoadmapItemDto,
  UpdateRoadmapItemDto,
  ImportRoadmapDto,
} from './dto/roadmap.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do módulo Roadmaps: CRUD da trilha + sub-recurso de itens.
 * Rotas finais em /api/roadmaps. Toda rota opera no workspace ativo (`@WorkspaceId()`).
 */
@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.roadmapsService.findAll(workspaceId);
  }

  // Rotas estáticas antes de `:id` para não serem capturadas pelo parâmetro.
  @Get('templates')
  listTemplates() {
    return this.roadmapsService.listTemplates();
  }

  @Get('templates/:templateId')
  getTemplate(@Param('templateId') templateId: string) {
    return this.roadmapsService.getTemplate(templateId);
  }

  @Post('import')
  importTemplate(
    @Body() dto: ImportRoadmapDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.roadmapsService.importTemplate(dto.templateId, workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.roadmapsService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateRoadmapDto, @WorkspaceId() workspaceId: string) {
    return this.roadmapsService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoadmapDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.roadmapsService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.roadmapsService.remove(id, workspaceId);
  }

  // ─── Itens ───────────────────────────────────────────────────────────────

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateRoadmapItemDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.roadmapsService.addItem(id, dto, workspaceId);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateRoadmapItemDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.roadmapsService.updateItem(id, itemId, dto, workspaceId);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.roadmapsService.removeItem(id, itemId, workspaceId);
  }
}
