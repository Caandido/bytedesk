import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type {
  Invite,
  InvitePreview,
  Workspace,
  WorkspaceMember,
} from '@devflow/shared';
import type { Workspace as PrismaWorkspace } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, CreateInviteDto, UpdateMemberDto } from './dto/workspace.dto';

/** Validade padrão de um convite (7 dias). */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Times (Fase 2): criar workspaces, gerir membros e convidar por link. As rotas
 * de gestão são restritas a OWNER/ADMIN pelo `RolesGuard`; a lógica aqui reforça
 * as invariantes (não mexer no dono, papéis atribuíveis, etc.).
 */
@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria um workspace novo e vazio, com o criador como OWNER. */
  async create(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: { name: dto.name, ownerId: userId },
    });
    await this.prisma.membership.create({
      data: { userId, workspaceId: workspace.id, role: 'OWNER' },
    });
    return this.toWorkspace(workspace, 'OWNER');
  }

  /** Lista os membros do workspace (qualquer membro pode ver). */
  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const workspace = await this.getWorkspaceOr404(workspaceId);
    const memberships = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      isOwner: workspace.ownerId === m.userId,
      joinedAt: m.createdAt,
    }));
  }

  /** Altera o papel de um membro (não pode alterar o dono). */
  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    dto: UpdateMemberDto,
  ): Promise<WorkspaceMember> {
    const workspace = await this.getWorkspaceOr404(workspaceId);
    if (workspace.ownerId === targetUserId) {
      throw new BadRequestException('O papel do dono não pode ser alterado');
    }
    const membership = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      include: { user: true },
    });
    if (!membership) {
      throw new NotFoundException('Membro não encontrado');
    }
    const updated = await this.prisma.membership.update({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      data: { role: dto.role },
      include: { user: true },
    });
    return {
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      role: updated.role,
      isOwner: false,
      joinedAt: updated.createdAt,
    };
  }

  /** Remove um membro do workspace (não pode remover o dono). */
  async removeMember(workspaceId: string, targetUserId: string): Promise<void> {
    const workspace = await this.getWorkspaceOr404(workspaceId);
    if (workspace.ownerId === targetUserId) {
      throw new BadRequestException('O dono não pode ser removido do workspace');
    }
    const membership = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!membership) {
      throw new NotFoundException('Membro não encontrado');
    }
    await this.prisma.membership.delete({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
  }

  /** Renomeia o workspace ativo (OWNER). */
  async rename(
    workspaceId: string,
    dto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    await this.getWorkspaceOr404(workspaceId);
    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: dto.name },
    });
    return this.toWorkspace(updated, 'OWNER');
  }

  /** Exclui o workspace ativo e TODOS os seus dados (OWNER). Bloqueia o último. */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    await this.getWorkspaceOr404(workspaceId);
    const count = await this.prisma.membership.count({ where: { userId } });
    if (count <= 1) {
      throw new BadRequestException(
        'Você não pode excluir seu único workspace',
      );
    }
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  /** Sai do workspace (membro não-dono). Bloqueia o dono e o último workspace. */
  async leave(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.getWorkspaceOr404(workspaceId);
    if (workspace.ownerId === userId) {
      throw new BadRequestException(
        'O dono não pode sair — transfira a propriedade ou exclua o workspace',
      );
    }
    const count = await this.prisma.membership.count({ where: { userId } });
    if (count <= 1) {
      throw new BadRequestException('Você não pode sair do seu único workspace');
    }
    await this.prisma.membership.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  }

  /** Transfere a propriedade para outro membro; o antigo dono vira ADMIN. */
  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    targetUserId: string,
  ): Promise<void> {
    const workspace = await this.getWorkspaceOr404(workspaceId);
    if (workspace.ownerId !== currentOwnerId) {
      throw new ForbiddenException('Apenas o dono pode transferir a propriedade');
    }
    if (targetUserId === currentOwnerId) {
      throw new BadRequestException('Você já é o dono');
    }
    const target = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!target) {
      throw new NotFoundException('O novo dono precisa ser membro do workspace');
    }
    await this.prisma.$transaction([
      this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: targetUserId },
      }),
      this.prisma.membership.update({
        where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
        data: { role: 'OWNER' },
      }),
      this.prisma.membership.update({
        where: { userId_workspaceId: { userId: currentOwnerId, workspaceId } },
        data: { role: 'ADMIN' },
      }),
    ]);
  }

  // ─── Convites ──────────────────────────────────────────────────────────────

  /** Cria um convite por link (token). */
  async createInvite(
    workspaceId: string,
    invitedById: string,
    dto: CreateInviteDto,
  ): Promise<Invite> {
    await this.getWorkspaceOr404(workspaceId);
    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const invite = await this.prisma.invite.create({
      data: {
        workspaceId,
        invitedById,
        email: dto.email ?? '',
        role: dto.role ?? 'MEMBER',
        token,
        expiresAt,
      },
      include: { invitedBy: { select: { name: true } } },
    });
    return this.toInvite(invite);
  }

  /** Lista os convites pendentes (não aceitos e não expirados). */
  async listInvites(workspaceId: string): Promise<Invite[]> {
    const invites = await this.prisma.invite.findMany({
      where: { workspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
      include: { invitedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return invites.map((i) => this.toInvite(i));
  }

  /** Revoga (apaga) um convite pendente do workspace. */
  async revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      select: { workspaceId: true },
    });
    if (!invite || invite.workspaceId !== workspaceId) {
      throw new NotFoundException('Convite não encontrado');
    }
    await this.prisma.invite.delete({ where: { id: inviteId } });
  }

  /** Prévia de um convite (tela de aceitar) — só exige estar autenticado. */
  async previewInvite(token: string, userId: string): Promise<InvitePreview> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      include: {
        workspace: { select: { name: true } },
        invitedBy: { select: { name: true } },
      },
    });
    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }
    const membership = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } },
      select: { userId: true },
    });
    return {
      workspaceName: invite.workspace.name,
      role: invite.role,
      invitedByName: invite.invitedBy.name,
      email: invite.email,
      expired: Boolean(invite.acceptedAt) || invite.expiresAt < new Date(),
      alreadyMember: Boolean(membership),
    };
  }

  /** Aceita um convite: cria a membership e marca o convite como aceito. */
  async acceptInvite(token: string, userId: string): Promise<Workspace> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      include: { workspace: true },
    });
    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }
    if (invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new ForbiddenException('Este convite expirou ou já foi usado');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } },
    });
    if (existing) {
      // Já é membro: marca o convite como aceito e retorna o workspace.
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return this.toWorkspace(invite.workspace, existing.role);
    }

    await this.prisma.$transaction([
      this.prisma.membership.create({
        data: { userId, workspaceId: invite.workspaceId, role: invite.role },
      }),
      this.prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
    return this.toWorkspace(invite.workspace, invite.role);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async getWorkspaceOr404(id: string): Promise<PrismaWorkspace> {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      throw new NotFoundException('Workspace não encontrado');
    }
    return workspace;
  }

  private toWorkspace(
    workspace: PrismaWorkspace,
    role: WorkspaceMember['role'],
  ): Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      role,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  private toInvite(invite: {
    id: string;
    email: string;
    role: WorkspaceMember['role'];
    token: string;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
    invitedBy: { name: string };
  }): Invite {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      invitedByName: invite.invitedBy.name,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt,
      createdAt: invite.createdAt,
    };
  }
}
