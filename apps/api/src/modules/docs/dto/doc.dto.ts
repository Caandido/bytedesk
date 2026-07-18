import { createZodDto } from 'nestjs-zod';
import { createDocSchema, updateDocSchema } from '@devflow/shared';

/** DTOs do sub-módulo Documentação derivados dos schemas Zod compartilhados. */
export class CreateDocDto extends createZodDto(createDocSchema) {}
export class UpdateDocDto extends createZodDto(updateDocSchema) {}
