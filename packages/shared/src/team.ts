import { z } from 'zod';
import { idSchema } from './common';
import { membershipRoleSchema } from './auth';

/**
 * Contratos de **Times** (Fase 2): criar workspaces, listar/gerir membros e
 * convidar por link. Reaproveita `membershipRoleSchema` de `auth.ts`.
 */

/** Papéis que podem ser atribuídos por convite/edição (OWNER é só o criador). */
export const assignableRoleSchema = membershipRoleSchema.exclude(['OWNER']);

/** Criar um novo workspace. */
export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(120),
});
export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;

/** Membro de um workspace (para a tela de gestão). */
export const workspaceMemberSchema = z.object({
  userId: idSchema,
  name: z.string(),
  email: z.string(),
  role: membershipRoleSchema,
  isOwner: z.boolean(),
  joinedAt: z.coerce.date(),
});
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;

/** Alterar o papel de um membro. */
export const updateMemberSchema = z.object({ role: assignableRoleSchema });
export type UpdateMemberInput = z.input<typeof updateMemberSchema>;

/** E-mail do convite: vazio (só link) ou um e-mail válido. */
const inviteEmailSchema = z
  .union([
    z.literal(''),
    z.string().trim().toLowerCase().email('E-mail inválido').max(200),
  ])
  .optional()
  .default('');

/** Criar um convite (por link). O e-mail é opcional (rótulo/hint). */
export const createInviteSchema = z.object({
  email: inviteEmailSchema,
  role: assignableRoleSchema.default('MEMBER'),
});
export type CreateInviteInput = z.input<typeof createInviteSchema>;

/** Convite retornado aos administradores (inclui o token do link). */
export const inviteSchema = z.object({
  id: idSchema,
  email: z.string(),
  role: membershipRoleSchema,
  token: z.string(),
  invitedByName: z.string(),
  expiresAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type Invite = z.infer<typeof inviteSchema>;

/** Prévia pública de um convite (tela de aceitar). */
export const invitePreviewSchema = z.object({
  workspaceName: z.string(),
  role: membershipRoleSchema,
  invitedByName: z.string(),
  email: z.string(),
  expired: z.boolean(),
  alreadyMember: z.boolean(),
});
export type InvitePreview = z.infer<typeof invitePreviewSchema>;
