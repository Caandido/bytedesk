import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRoadmapDto,
  UpdateRoadmapDto,
  CreateRoadmapItemDto,
  UpdateRoadmapItemDto,
} from './dto/roadmap.dto';
import {
  ROADMAP_CATALOG,
  type RoadmapTemplate,
  type CatalogItem,
  type CatalogLink,
} from './roadmap-catalog';

/** Sempre trazemos os itens ordenados junto da trilha. */
const roadmapInclude = {
  items: { orderBy: { position: 'asc' } },
} satisfies Prisma.RoadmapInclude;

/** Link de busca de vídeo-aulas no YouTube para um tópico. */
function videoLink(roadmapName: string, title: string): CatalogLink {
  const q = encodeURIComponent(`${roadmapName} ${title} tutorial`);
  return {
    label: '🎥 Vídeo-aulas',
    url: `https://www.youtube.com/results?search_query=${q}`,
  };
}

/**
 * Mapeamento palavra-chave → roadmap dedicado (ordem: mais específico primeiro).
 * Cria cross-links automáticos (estilo Obsidian) entre os tópicos e os roadmaps.
 */
const KEYWORD_LINKS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bhtml\b/i, 'html'],
  [/\bcss\b|flexbox|\bgrid\b/i, 'css'],
  [/\btypescript\b/i, 'typescript'],
  [/\bjavascript\b/i, 'javascript'],
  [/\breact\b/i, 'react'],
  [/\bvue\b|nuxt/i, 'vue'],
  [/\bangular\b/i, 'angular'],
  [/\bnext\.?js\b/i, 'nextjs'],
  [/tailwind/i, 'tailwind'],
  [/\bnode(\.?js)?\b|express|nestjs/i, 'nodejs'],
  [/\bpython\b/i, 'python'],
  [/\bjava\b/i, 'java'],
  [/\brust\b/i, 'rust'],
  [/c\+\+/i, 'cpp'],
  [/\bphp\b|laravel/i, 'php'],
  [/\bgo(lang)?\b/i, 'go'],
  [/\bdocker\b/i, 'docker'],
  [/\bkubernetes\b/i, 'kubernetes'],
  [/\blinux\b/i, 'linux'],
  [/\baws\b/i, 'aws'],
  [/\bgraphql\b/i, 'graphql'],
  [/mongo|nosql/i, 'mongodb'],
  [/\bredis\b/i, 'redis'],
  [/postgre|\bsql\b|relacion/i, 'sql'],
  [/\bgit(hub)?\b/i, 'git'],
  [/\bflutter\b/i, 'flutter'],
  [/system design|projeto de sistemas/i, 'system-design'],
];

const CATALOG_IDS = new Set(ROADMAP_CATALOG.map((t) => t.id));

/** Infere o roadmap dedicado de um tópico (evita auto-referência). */
function resolveLinkTo(
  title: string,
  currentId: string,
): string | undefined {
  for (const [re, id] of KEYWORD_LINKS) {
    if (id !== currentId && CATALOG_IDS.has(id) && re.test(title)) return id;
  }
  return undefined;
}

/**
 * Enriquece cada item com: link de vídeo-aulas, cross-link para o roadmap
 * dedicado (quando o tópico corresponde a outro roadmap) e o campo `linkTo`.
 */
function enrichTemplate(template: RoadmapTemplate): RoadmapTemplate {
  return {
    ...template,
    items: template.items.map<CatalogItem>((item) => {
      const linkTo = item.linkTo ?? resolveLinkTo(item.title, template.id);
      const links: CatalogLink[] = [
        ...(item.links ?? []),
        videoLink(template.name, item.title),
      ];
      if (linkTo) {
        links.push({
          label: '🧭 Roadmap dedicado',
          url: `/roadmaps/guia/${linkTo}`,
        });
      }
      return { ...item, linkTo, links };
    }),
  };
}

/**
 * Regras de acesso a dados do módulo Roadmaps. Mesmo padrão do StudiesService
 * (itens de trilha equivalem aos objetivos de estudo). Tudo é escopado por
 * workspace: a trilha (entidade-raiz) tem `workspaceId`; os itens são escopados
 * VIA a trilha pai.
 */
@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    return this.prisma.roadmap.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: roadmapInclude,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const roadmap = await this.prisma.roadmap.findFirst({
      where: { id, workspaceId },
      include: roadmapInclude,
    });
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${id} não encontrado`);
    }
    return roadmap;
  }

  create(dto: CreateRoadmapDto, workspaceId: string) {
    return this.prisma.roadmap.create({
      data: { ...dto, workspaceId },
      include: roadmapInclude,
    });
  }

  async update(id: string, dto: UpdateRoadmapDto, workspaceId: string) {
    await this.ensureRoadmap(id, workspaceId);
    return this.prisma.roadmap.update({
      where: { id },
      data: dto,
      include: roadmapInclude,
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.ensureRoadmap(id, workspaceId);
    return this.prisma.roadmap.delete({ where: { id } });
  }

  // ─── Catálogo (importar de roadmap.sh) ─────────────────────────────────────

  /** Lista os templates disponíveis (resumo, sem os itens). */
  listTemplates() {
    return ROADMAP_CATALOG.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      url: t.url,
      itemCount: t.items.length,
    }));
  }

  /** Retorna um template completo enriquecido (itens, descrições, links + vídeo). */
  getTemplate(templateId: string) {
    const template = ROADMAP_CATALOG.find((t) => t.id === templateId);
    if (!template) {
      throw new NotFoundException(`Template ${templateId} não encontrado`);
    }
    return enrichTemplate(template);
  }

  /** Cria uma trilha a partir de um template do catálogo (com seus itens ricos). */
  async importTemplate(templateId: string, workspaceId: string) {
    const template = this.getTemplate(templateId);
    return this.prisma.roadmap.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        workspaceId,
        items: {
          create: template.items.map((item, position) => ({
            title: item.title,
            description: item.description ?? '',
            links: (item.links ?? []) as unknown as Prisma.InputJsonValue,
            position,
          })),
        },
      },
      include: roadmapInclude,
    });
  }

  // ─── Itens ─────────────────────────────────────────────────────────────────

  async addItem(
    roadmapId: string,
    dto: CreateRoadmapItemDto,
    workspaceId: string,
  ) {
    await this.ensureRoadmap(roadmapId, workspaceId);
    // Sub-item: valida que o pai é da mesma trilha (aninhamento em qualquer nível).
    if (dto.parentId) {
      const parent = await this.prisma.roadmapItem.findFirst({
        where: { id: dto.parentId, roadmapId },
        select: { id: true },
      });
      if (!parent) {
        throw new NotFoundException('Item pai não encontrado nesta trilha');
      }
    }
    // Posição no fim do grupo (irmãos com o mesmo parentId).
    const count = await this.prisma.roadmapItem.count({
      where: { roadmapId, parentId: dto.parentId ?? null },
    });
    return this.prisma.roadmapItem.create({
      data: {
        roadmapId,
        parentId: dto.parentId ?? null,
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
    workspaceId: string,
  ) {
    await this.ensureItem(roadmapId, itemId, workspaceId);
    const data: Prisma.RoadmapItemUncheckedUpdateInput = { ...dto };
    if (dto.links !== undefined) {
      data.links = dto.links as Prisma.InputJsonValue;
    }
    return this.prisma.roadmapItem.update({ where: { id: itemId }, data });
  }

  async removeItem(roadmapId: string, itemId: string, workspaceId: string) {
    await this.ensureItem(roadmapId, itemId, workspaceId);
    return this.prisma.roadmapItem.delete({ where: { id: itemId } });
  }

  /**
   * Reordena os itens da trilha (arrastar-e-soltar): grava a posição de cada id
   * conforme a ordem recebida. Só considera itens que realmente pertencem à
   * trilha (defesa contra ids de outra trilha/workspace).
   */
  async reorderItems(
    roadmapId: string,
    itemIds: string[],
    workspaceId: string,
  ) {
    await this.ensureRoadmap(roadmapId, workspaceId);
    const owned = await this.prisma.roadmapItem.findMany({
      where: { roadmapId },
      select: { id: true },
    });
    const validIds = new Set(owned.map((i) => i.id));
    const ordered = itemIds.filter((id) => validIds.has(id));
    await this.prisma.$transaction(
      ordered.map((id, index) =>
        this.prisma.roadmapItem.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );
    return this.findOne(roadmapId, workspaceId);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async ensureRoadmap(id: string, workspaceId: string): Promise<void> {
    const exists = await this.prisma.roadmap.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Roadmap ${id} não encontrado`);
    }
  }

  private async ensureItem(
    roadmapId: string,
    itemId: string,
    workspaceId: string,
  ): Promise<void> {
    // Garante primeiro que a trilha pai pertence ao workspace ativo.
    await this.ensureRoadmap(roadmapId, workspaceId);
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
