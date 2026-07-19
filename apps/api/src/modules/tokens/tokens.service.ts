import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { ApiToken, ApiTokenCreated } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { API_TOKEN_PREFIX, hashApiToken } from '../auth/jwt-auth.guard';
import { CreateApiTokenDto } from './dto/token.dto';

/**
 * Tokens de API pessoais. O valor cru só existe no momento da criação (retornado
 * uma vez); guardamos apenas o hash. O token embute o workspace ativo.
 */
@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateApiTokenDto,
  ): Promise<ApiTokenCreated> {
    const token = `${API_TOKEN_PREFIX}${randomBytes(24).toString('base64url')}`;
    const created = await this.prisma.apiToken.create({
      data: {
        userId,
        workspaceId,
        name: dto.name,
        tokenHash: hashApiToken(token),
      },
    });
    return {
      id: created.id,
      name: created.name,
      lastUsedAt: created.lastUsedAt,
      createdAt: created.createdAt,
      token,
    };
  }

  /** Lista os tokens do usuário no workspace ativo (sem o valor secreto). */
  async list(userId: string, workspaceId: string): Promise<ApiToken[]> {
    const tokens = await this.prisma.apiToken.findMany({
      where: { userId, workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, lastUsedAt: true, createdAt: true },
    });
    return tokens;
  }

  /** Revoga (apaga) um token do próprio usuário. */
  async revoke(userId: string, id: string): Promise<void> {
    const result = await this.prisma.apiToken.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Token não encontrado');
    }
  }
}
