import { SetMetadata } from '@nestjs/common';
import type { MembershipRole } from '@devflow/shared';

/** Exige que o usuário tenha um dos papéis no workspace ativo (ver RolesGuard). */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: MembershipRole[]) => SetMetadata(ROLES_KEY, roles);
