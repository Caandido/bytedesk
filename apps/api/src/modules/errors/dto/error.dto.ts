import { createZodDto } from 'nestjs-zod';
import {
  createKnownErrorSchema,
  updateKnownErrorSchema,
} from '@devflow/shared';

/** DTOs do módulo Banco de Erros derivados dos schemas Zod compartilhados. */
export class CreateKnownErrorDto extends createZodDto(createKnownErrorSchema) {}
export class UpdateKnownErrorDto extends createZodDto(updateKnownErrorSchema) {}
