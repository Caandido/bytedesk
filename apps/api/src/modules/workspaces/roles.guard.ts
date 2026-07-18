import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { MembershipRole } from '@devflow/shared';
import { ROLES_KEY } from './roles.decorator';
import type { AuthedRequest } from '../auth/auth.decorators';

/**
 * Restringe uma rota aos papéis exigidos no workspace ativo. Depende do
 * `JwtAuthGuard` (global) ter resolvido `req.membershipRole` a partir do header
 * `x-workspace-id`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<MembershipRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!req.membershipRole || !roles.includes(req.membershipRole)) {
      throw new ForbiddenException('Você não tem permissão para esta ação');
    }
    return true;
  }
}
