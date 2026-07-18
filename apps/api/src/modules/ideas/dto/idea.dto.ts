import { createZodDto } from 'nestjs-zod';
import { createIdeaSchema, updateIdeaSchema } from '@devflow/shared';

/** DTOs do sub-módulo Banco de Ideias derivados dos schemas Zod compartilhados. */
export class CreateIdeaDto extends createZodDto(createIdeaSchema) {}
export class UpdateIdeaDto extends createZodDto(updateIdeaSchema) {}
