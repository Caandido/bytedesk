import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRoadmapDto,
  UpdateRoadmapDto,
  CreateRoadmapItemDto,
  UpdateRoadmapItemDto,
} from './dto/roadmap.dto';

/** Sempre trazemos os itens ordenados junto da trilha. */
const roadmapInclude = {
  items: { orderBy: { position: 'asc' } },
} satisfies Prisma.RoadmapInclude;

/**
 * Regras de acesso a dados do módulo Roadmaps. Mesmo padrão do StudiesService
 * (itens de trilha equivalem aos objetivos de estudo).
 */
@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.roadmap.findMany({
      orderBy: { updatedAt: 'desc' },
      include: roadmapInclude,
    });
  }

  async findOne(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      include: roadmapInclude,
    });
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${id} não encontrado`);
    }
    return roadmap;
  }

  create(dto: CreateRoadmapDto) {
    return this.prisma.roadmap.create({ data: dto, include: roadmapInclude });
  }

  async update(id: string, dto: UpdateRoadmapDto) {
    await this.ensureRoadmap(id);
    return this.prisma.roadmap.update({
      where: { id },
      data: dto,
      include: roadmapInclude,
    });
  }

  async remove(id: string) {
    await this.ensureRoadmap(id);
    return this.prisma.roadmap.delete({ where: { id } });
  }

  // ─── Itens ─────────────────────────────────────────────────────────────────

  async addItem(roadmapId: string, dto: CreateRoadmapItemDto) {
    await this.ensureRoadmap(roadmapId);
    const count = await this.prisma.roadmapItem.count({ where: { roadmapId } });
    return this.prisma.roadmapItem.create({
      data: {
        roadmapId,
        title: dto.title,
        description: dto.description,
        recommendedTime: dto.recommendedTime,
        links: dto.links as Prisma.InputJsonValue,
        position: count,
      },
    });
  }

  async updateItem(
    roadmapId: string,
    itemId: string,
    dto: UpdateRoadmapItemDto,
  ) {
    await this.ensureItem(roadmapId, itemId);
    const data: Prisma.RoadmapItemUncheckedUpdateInput = { ...dto };
    if (dto.links !== undefined) {
      data.links = dto.links as Prisma.InputJsonValue;
    }
    return this.prisma.roadmapItem.update({ where: { id: itemId }, data });
  }

  async removeItem(roadmapId: string, itemId: string) {
    await this.ensureItem(roadmapId, itemId);
    return this.prisma.roadmapItem.delete({ where: { id: itemId } });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async ensureRoadmap(id: string): Promise<void> {
    const exists = await this.prisma.roadmap.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Roadmap ${id} não encontrado`);
    }
  }

  private async ensureItem(roadmapId: string, itemId: string): Promise<void> {
    const item = await this.prisma.roadmapItem.findUnique({
      where: { id: itemId },
      select: { roadmapId: true },
    });
    if (!item || item.roadmapId !== roadmapId) {
      throw new NotFoundException(
        `Item ${itemId} não encontrado no roadmap ${roadmapId}`,
      );
    }
  }
}
