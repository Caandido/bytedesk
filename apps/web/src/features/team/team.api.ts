import { apiFetch } from '@/services/api';
import type {
  CreateInviteInput,
  CreateWorkspaceInput,
  Invite,
  InvitePreview,
  UpdateMemberInput,
  Workspace,
  WorkspaceMember,
} from '@devflow/shared';

/** Chamadas à API de times (workspace ativo via header x-workspace-id). */
export const teamApi = {
  createWorkspace: (input: CreateWorkspaceInput) =>
    apiFetch<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  members: () => apiFetch<WorkspaceMember[]>('/workspaces/members'),
  updateMember: (userId: string, input: UpdateMemberInput) =>
    apiFetch<WorkspaceMember>(`/workspaces/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  removeMember: (userId: string) =>
    apiFetch<void>(`/workspaces/members/${userId}`, { method: 'DELETE' }),
  invites: () => apiFetch<Invite[]>('/workspaces/invites'),
  createInvite: (input: CreateInviteInput) =>
    apiFetch<Invite>('/workspaces/invites', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  revokeInvite: (id: string) =>
    apiFetch<void>(`/workspaces/invites/${id}`, { method: 'DELETE' }),
  previewInvite: (token: string) =>
    apiFetch<InvitePreview>(`/invites/${token}`),
  acceptInvite: (token: string) =>
    apiFetch<Workspace>(`/invites/${token}/accept`, { method: 'POST' }),
};
