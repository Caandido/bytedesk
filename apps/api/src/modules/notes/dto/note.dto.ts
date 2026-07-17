import { createZodDto } from 'nestjs-zod';
import { createNoteSchema, updateNoteSchema } from '@devflow/shared';

/**
 * DTOs derivados dos schemas Zod compartilhados (`@devflow/shared`).
 * A validação é aplicada pelo `ZodValidationPipe` global (main.ts).
 */
export class CreateNoteDto extends createZodDto(createNoteSchema) {}
export class UpdateNoteDto extends createZodDto(updateNoteSchema) {}
