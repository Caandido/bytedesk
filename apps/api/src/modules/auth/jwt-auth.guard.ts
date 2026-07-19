import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY, type AuthedRequest } from './auth.decorators';

/** Formato do payload assinado no JWT. */
interface JwtPayload {
  sub: string;
}

/** Prefixo dos tokens de API (ex.: extensão do VSCode). */
export const API_TOKEN_PREFIX = 'bd_';

/** Hash (sha256) usado para guardar/consultar tokens de API sem o valor cru. */
export function hashApiToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Guard global: autentica pelo `Authorization: Bearer <credencial>` (exceto rotas
 * `@Public()`). A credencial pode ser um **JWT** (com o workspace vindo do header
 * `x-workspace-id`) ou um **token de API** `bd_...` (que já embute o workspace).
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
    const credential = header.slice(7);

    // Token de API: autentica e escopa o workspace pelo próprio token.
    if (credential.startsWith(API_TOKEN_PREFIX)) {
      return this.authenticateApiToken(req, credential);
    }

    // JWT: workspace vem do header x-workspace-id.
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(credential);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    req.userId = payload.sub;

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

  private async authenticateApiToken(
    req: AuthedRequest,
    credential: string,
  ): Promise<boolean> {
    const apiToken = await this.prisma.apiToken.findUnique({
      where: { tokenHash: hashApiToken(credential) },
      select: { id: true, userId: true, workspaceId: true },
    });
    if (!apiToken) {
      throw new UnauthorizedException('Token de API inválido');
    }
    // O papel vem da membership atual (o acesso pode ter sido revogado).
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: apiToken.userId,
          workspaceId: apiToken.workspaceId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Sem acesso a este workspace');
    }
    req.userId = apiToken.userId;
    req.workspaceId = apiToken.workspaceId;
    req.membershipRole = membership.role;

    // Atualiza o "último uso" sem bloquear a requisição.
    void this.prisma.apiToken
      .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);

    return true;
  }
}
