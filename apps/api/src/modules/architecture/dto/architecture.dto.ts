import { createZodDto } from 'nestjs-zod';
import { updateArchitectureSchema } from '@devflow/shared';

/** DTO do sub-módulo Arquitetura derivado do schema Zod compartilhado. */
export class UpdateArchitectureDto extends createZodDto(
  updateArchitectureSchema,
) {}
