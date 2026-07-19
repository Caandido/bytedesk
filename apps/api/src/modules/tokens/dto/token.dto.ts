import { createZodDto } from 'nestjs-zod';
import { createApiTokenSchema } from '@devflow/shared';

/** DTO de criação de token de API. */
export class CreateApiTokenDto extends createZodDto(createApiTokenSchema) {}
