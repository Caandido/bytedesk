import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos de **Autenticação e Workspaces** (multiusuário/times). Fonte única da
 * verdade: valida o registro/login no back (DTO) e no front (formulário), e tipa
 * a resposta autenticada (usuário + token + workspaces).
 */

/** Papel de um membro dentro de um workspace. */
export const membershipRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;

// ─── Payloads de entrada ─────────────────────────────────────────────────────

/** Registro de uma nova conta. */
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório').max(120),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(200),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(200),
});

/** Login com e-mail e senha. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(200),
  password: z.string().min(1, 'Informe a senha').max(200),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;

// ─── Entidades retornadas ────────────────────────────────────────────────────

/** Usuário autenticado (sem o hash da senha). */
export const authUserSchema = z
  .object({
    id: idSchema,
    email: z.string(),
    name: z.string(),
  })
  .merge(timestampsSchema);
export type AuthUser = z.infer<typeof authUserSchema>;

/** Workspace ao qual o usuário pertence, com o papel dele. */
export const workspaceSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    ownerId: z.string().nullable(),
    role: membershipRoleSchema,
  })
  .merge(timestampsSchema);
export type Workspace = z.infer<typeof workspaceSchema>;

/** Resposta de register/login: token JWT + usuário + workspaces + ativo. */
export const authResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
  workspaces: z.array(workspaceSchema),
  activeWorkspaceId: idSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** Resposta de GET /auth/me (sessão atual, sem novo token). */
export const sessionSchema = z.object({
  user: authUserSchema,
  workspaces: z.array(workspaceSchema),
});
export type Session = z.infer<typeof sessionSchema>;
