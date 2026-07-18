import { createZodDto } from 'nestjs-zod';
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  createRoadmapItemSchema,
  updateRoadmapItemSchema,
  reorderRoadmapItemsSchema,
  importRoadmapSchema,
} from '@devflow/shared';

/** DTOs do módulo Roadmaps derivados dos schemas Zod compartilhados. */
export class CreateRoadmapDto extends createZodDto(createRoadmapSchema) {}
export class UpdateRoadmapDto extends createZodDto(updateRoadmapSchema) {}
export class CreateRoadmapItemDto extends createZodDto(
  createRoadmapItemSchema,
) {}
export class UpdateRoadmapItemDto extends createZodDto(
  updateRoadmapItemSchema,
) {}
export class ReorderRoadmapItemsDto extends createZodDto(
  reorderRoadmapItemsSchema,
) {}
export class ImportRoadmapDto extends createZodDto(importRoadmapSchema) {}
