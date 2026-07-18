import { createZodDto } from 'nestjs-zod';
import { createVersionSchema, updateVersionSchema } from '@devflow/shared';

/** DTOs do sub-módulo Versionamento derivados dos schemas Zod compartilhados. */
export class CreateVersionDto extends createZodDto(createVersionSchema) {}
export class UpdateVersionDto extends createZodDto(updateVersionSchema) {}
