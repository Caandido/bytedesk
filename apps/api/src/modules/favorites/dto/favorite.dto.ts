import { createZodDto } from 'nestjs-zod';
import { createFavoriteSchema } from '@devflow/shared';

/** DTO de criação de favorito derivado do schema Zod compartilhado. */
export class CreateFavoriteDto extends createZodDto(createFavoriteSchema) {}
