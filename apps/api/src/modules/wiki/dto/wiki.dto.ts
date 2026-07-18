import { createZodDto } from 'nestjs-zod';
import { createWikiPageSchema, updateWikiPageSchema } from '@devflow/shared';

/** DTOs do módulo Conhecimento derivados dos schemas Zod compartilhados. */
export class CreateWikiPageDto extends createZodDto(createWikiPageSchema) {}
export class UpdateWikiPageDto extends createZodDto(updateWikiPageSchema) {}
