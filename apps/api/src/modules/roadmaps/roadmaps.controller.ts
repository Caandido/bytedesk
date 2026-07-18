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

/**
 * API do módulo Roadmaps: CRUD da trilha + sub-recurso de itens.
 * Rotas finais em /api/roadmaps.
 */
@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  findAll() {
    return this.roadmapsService.findAll();
  }

  // Rotas estáticas antes de `:id` para não serem capturadas pelo parâmetro.
  @Get('templates')
  listTemplates() {
    return this.roadmapsService.listTemplates();
  }

  @Post('import')
  importTemplate(@Body() dto: ImportRoadmapDto) {
    return this.roadmapsService.importTemplate(dto.templateId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roadmapsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRoadmapDto) {
    return this.roadmapsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoadmapDto) {
    return this.roadmapsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roadmapsService.remove(id);
  }

  // ─── Itens ───────────────────────────────────────────────────────────────

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateRoadmapItemDto) {
    return this.roadmapsService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateRoadmapItemDto,
  ) {
    return this.roadmapsService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.roadmapsService.removeItem(id, itemId);
  }
}
