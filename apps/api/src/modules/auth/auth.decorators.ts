import {
  createParamDecorator,
  BadRequestException,
  SetMetadata,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { MembershipRole } from '@devflow/shared';

/** Requisição enriquecida pelo `JwtAuthGuard` com o usuário e o workspace ativo. */
export interface AuthedRequest extends Request {
  userId?: string;
  workspaceId?: string;
  membershipRole?: MembershipRole;
}

/** Marca uma rota como pública (sem exigir token) — ex.: health, register, login. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Injeta o id do usuário autenticado (definido pelo `JwtAuthGuard`). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (!req.userId) {
      throw new BadRequestException('Usuário não autenticado');
    }
    return req.userId;
  },
);

/**
 * Injeta o id do workspace ativo (header `x-workspace-id`), já validado como
 * pertencente ao usuário pelo `JwtAuthGuard`. Lança 400 se ausente — toda rota de
 * dados precisa de um workspace.
 */
export const WorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (!req.workspaceId) {
      throw new BadRequestException(
        'Workspace não informado (header x-workspace-id)',
      );
    }
    return req.workspaceId;
  },
);
