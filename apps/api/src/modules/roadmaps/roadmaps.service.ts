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
  async importTemplate(templateId: string) {
    const template = this.getTemplate(templateId);
    return this.prisma.roadmap.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
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
