import { createZodDto } from 'nestjs-zod';
import { createDiaryEntrySchema, updateDiaryEntrySchema } from '@devflow/shared';

/** DTOs do módulo Diário derivados dos schemas Zod compartilhados. */
export class CreateDiaryEntryDto extends createZodDto(createDiaryEntrySchema) {}
export class UpdateDiaryEntryDto extends createZodDto(updateDiaryEntrySchema) {}
