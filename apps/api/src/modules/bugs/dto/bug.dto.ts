import { createZodDto } from 'nestjs-zod';
import { createBugSchema, updateBugSchema } from '@devflow/shared';

/** DTOs do sub-módulo Bugs derivados dos schemas Zod compartilhados. */
export class CreateBugDto extends createZodDto(createBugSchema) {}
export class UpdateBugDto extends createZodDto(updateBugSchema) {}
