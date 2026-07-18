import { createZodDto } from 'nestjs-zod';
import {
  createStudySchema,
  updateStudySchema,
  createObjectiveSchema,
  updateObjectiveSchema,
} from '@devflow/shared';

/**
 * DTOs do módulo Estudos derivados dos schemas Zod compartilhados
 * (`@devflow/shared`). A validação é aplicada pelo `ZodValidationPipe` global.
 */
export class CreateStudyDto extends createZodDto(createStudySchema) {}
export class UpdateStudyDto extends createZodDto(updateStudySchema) {}
export class CreateObjectiveDto extends createZodDto(createObjectiveSchema) {}
export class UpdateObjectiveDto extends createZodDto(updateObjectiveSchema) {}
