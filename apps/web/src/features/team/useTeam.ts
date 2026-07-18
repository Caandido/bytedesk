import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateInviteInput,
  CreateWorkspaceInput,
  UpdateMemberInput,
} from '@devflow/shared';
import { useAuthStore } from '@/stores/auth';
import { teamApi } from './team.api';

/** Chaves de cache keadas pelo workspace ativo (refaz ao trocar de workspace). */
function useKeys() {
  const ws = useAuthStore((s) => s.activeWorkspaceId) ?? 'none';
  return {
    members: ['team', ws, 'members'] as const,
    invites: ['team', ws, 'invites'] as const,
  };
}

export function useMembers() {
  const keys = useKeys();
  return useQuery({ queryKey: keys.members, queryFn: teamApi.members });
}

export function useInvites(enabled: boolean) {
  const keys = useKeys();
  return useQuery({
    queryKey: keys.invites,
    queryFn: teamApi.invites,
    enabled,
  });
}

export function useCreateWorkspace() {
  const addWorkspace = useAuthStore((s) => s.addWorkspace);
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => teamApi.createWorkspace(input),
    onSuccess: (workspace) => addWorkspace(workspace, true),
  });
}

export function useRenameWorkspace() {
  const addWorkspace = useAuthStore((s) => s.addWorkspace);
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => teamApi.renameWorkspace(input),
    onSuccess: (workspace) => addWorkspace(workspace, false),
  });
}

export function useDeleteWorkspace() {
  const removeWorkspace = useAuthStore((s) => s.removeWorkspace);
  return useMutation({
    mutationFn: () => teamApi.deleteWorkspace(),
    onSuccess: () => {
      const activeId = useAuthStore.getState().activeWorkspaceId;
      if (activeId) removeWorkspace(activeId);
    },
  });
}

export function useLeaveWorkspace() {
  const removeWorkspace = useAuthStore((s) => s.removeWorkspace);
  return useMutation({
    mutationFn: () => teamApi.leaveWorkspace(),
    onSuccess: () => {
      const activeId = useAuthStore.getState().activeWorkspaceId;
      if (activeId) removeWorkspace(activeId);
    },
  });
}

export function useTransferOwnership() {
  const qc = useQueryClient();
  const addWorkspace = useAuthStore((s) => s.addWorkspace);
  const keys = useKeys();
  return useMutation({
    mutationFn: (userId: string) => teamApi.transferOwnership(userId),
    onSuccess: (_data, userId) => {
      // Quem transferiu vira ADMIN; atualiza o papel local do workspace ativo.
      const state = useAuthStore.getState();
      const active = state.workspaces.find(
        (w) => w.id === state.activeWorkspaceId,
      );
      if (active) {
        addWorkspace({ ...active, ownerId: userId, role: 'ADMIN' }, false);
      }
      qc.invalidateQueries({ queryKey: keys.members });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  const keys = useKeys();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateMemberInput }) =>
      teamApi.updateMember(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  const keys = useKeys();
  return useMutation({
    mutationFn: (userId: string) => teamApi.removeMember(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members }),
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  const keys = useKeys();
  return useMutation({
    mutationFn: (input: CreateInviteInput) => teamApi.createInvite(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invites }),
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  const keys = useKeys();
  return useMutation({
    mutationFn: (id: string) => teamApi.revokeInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invites }),
  });
}

export function useInvitePreview(token: string | undefined) {
  return useQuery({
    queryKey: ['invite-preview', token],
    queryFn: () => teamApi.previewInvite(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useAcceptInvite() {
  const addWorkspace = useAuthStore((s) => s.addWorkspace);
  return useMutation({
    mutationFn: (token: string) => teamApi.acceptInvite(token),
    onSuccess: (workspace) => addWorkspace(workspace, true),
  });
}
