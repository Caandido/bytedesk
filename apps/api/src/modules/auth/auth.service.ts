import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthResponse, Session, Workspace } from '@devflow/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

/** Id fixo do workspace-padrão que guarda os dados legados (ver migração). */
const DEFAULT_WORKSPACE_ID = 'ws_default';
const SALT_ROUNDS = 10;

/**
 * Regras de autenticação: registro (com "claim" do workspace-padrão dos dados
 * legados), login e leitura da sessão. Senhas são guardadas só como hash bcrypt.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, name: dto.name, passwordHash },
      });

      // "Claim": o 1º registro reivindica o workspace-padrão (e todos os dados
      // legados). Registros seguintes ganham um workspace novo e vazio.
      const orphanDefault = await tx.workspace.findFirst({
        where: { id: DEFAULT_WORKSPACE_ID, ownerId: null },
      });
      if (orphanDefault) {
        await tx.workspace.update({
          where: { id: orphanDefault.id },
          data: { ownerId: created.id },
        });
        await tx.membership.create({
          data: {
            userId: created.id,
            workspaceId: orphanDefault.id,
            role: 'OWNER',
          },
        });
        await tx.favorite.updateMany({
          where: { userId: null },
          data: { userId: created.id },
        });
      } else {
        const workspace = await tx.workspace.create({
          data: { name: `Workspace de ${dto.name}`, ownerId: created.id },
        });
        await tx.membership.create({
          data: { userId: created.id, workspaceId: workspace.id, role: 'OWNER' },
        });
      }

      return created;
    });

    return this.buildAuthResponse(user.id);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    return this.buildAuthResponse(user.id);
  }

  async getSession(userId: string): Promise<Session> {
    const { user, workspaces } = await this.loadUserAndWorkspaces(userId);
    return { user, workspaces };
  }

  private async buildAuthResponse(userId: string): Promise<AuthResponse> {
    const { user, workspaces } = await this.loadUserAndWorkspaces(userId);
    const token = await this.jwt.signAsync({ sub: user.id });
    return {
      token,
      user,
      workspaces,
      activeWorkspaceId: workspaces[0].id,
    };
  }

  private async loadUserAndWorkspaces(
    userId: string,
  ): Promise<{ user: Session['user']; workspaces: Workspace[] }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Sessão inválida');
    }
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    const workspaces: Workspace[] = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      ownerId: m.workspace.ownerId,
      role: m.role,
      createdAt: m.workspace.createdAt,
      updatedAt: m.workspace.updatedAt,
    }));
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      workspaces,
    };
  }
}
