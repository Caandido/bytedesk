import { createZodDto } from 'nestjs-zod';
import {
  createWorkspaceSchema,
  createInviteSchema,
  updateMemberSchema,
} from '@devflow/shared';

/** DTOs de times derivados dos schemas Zod compartilhados. */
export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
export class CreateInviteDto extends createZodDto(createInviteSchema) {}
export class UpdateMemberDto extends createZodDto(updateMemberSchema) {}
