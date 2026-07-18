import { createZodDto } from 'nestjs-zod';
import {
  createProjectSchema,
  updateProjectSchema,
  createObjectiveSchema,
  updateObjectiveSchema,
} from '@devflow/shared';

/**
 * DTOs do módulo Projetos derivados dos schemas Zod compartilhados. Os DTOs de
 * objetivo reutilizam os contratos de checklist compartilhados com Estudos.
 */
export class CreateProjectDto extends createZodDto(createProjectSchema) {}
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
export class CreateObjectiveDto extends createZodDto(createObjectiveSchema) {}
export class UpdateObjectiveDto extends createZodDto(updateObjectiveSchema) {}
