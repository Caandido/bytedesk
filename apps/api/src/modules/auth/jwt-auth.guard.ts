import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY, type AuthedRequest } from './auth.decorators';

/** Formato do payload assinado no JWT. */
interface JwtPayload {
  sub: string;
}

/**
 * Guard global: autentica pelo `Authorization: Bearer <jwt>` (exceto rotas
 * `@Public()`) e, se houver `x-workspace-id`, valida que o usuário é membro do
 * workspace, expondo `req.userId`/`req.workspaceId` para os decorators.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação ausente');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(header.slice(7));
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    req.userId = payload.sub;

    // Resolução do workspace ativo (opcional para rotas como /auth/me).
    const workspaceId = req.headers['x-workspace-id'];
    if (typeof workspaceId === 'string' && workspaceId.length > 0) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: { userId: payload.sub, workspaceId },
        },
      });
      if (!membership) {
        throw new ForbiddenException('Sem acesso a este workspace');
      }
      req.workspaceId = workspaceId;
      req.membershipRole = membership.role;
    }

    return true;
  }
}
