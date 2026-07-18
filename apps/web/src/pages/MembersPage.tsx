import { useState } from 'react';
import {
  Loader2,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  User as UserIcon,
  Link2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import type { MembershipRole, WorkspaceMember } from '@devflow/shared';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useMembers,
  useInvites,
  useUpdateMember,
  useRemoveMember,
  useCreateInvite,
  useRevokeInvite,
} from '@/features/team/useTeam';

const ROLE_LABEL: Record<MembershipRole, string> = {
  OWNER: 'Dono',
  ADMIN: 'Admin',
  MEMBER: 'Membro',
};

function RoleIcon({ role }: { role: MembershipRole }) {
  if (role === 'OWNER') return <Crown className="size-3.5" />;
  if (role === 'ADMIN') return <Shield className="size-3.5" />;
  return <UserIcon className="size-3.5" />;
}

/** Gestão de membros do workspace ativo: papéis, remoção e convites por link. */
export function MembersPage() {
  const user = useAuthStore((s) => s.user);
  const workspaces = useAuthStore((s) => s.workspaces);
  const activeId = useAuthStore((s) => s.activeWorkspaceId);
  const active = workspaces.find((w) => w.id === activeId);
  const canManage = active?.role === 'OWNER' || active?.role === 'ADMIN';

  const members = useMembers();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-gradient text-2xl font-bold tracking-tight">
          Membros
        </h1>
        <p className="text-muted-foreground">
          Quem tem acesso a <span className="font-medium">{active?.name}</span>.
        </p>
      </div>

      {canManage && <InviteSection />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Membros{' '}
            {members.data && (
              <span className="text-muted-foreground">
                ({members.data.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {members.isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Carregando…
            </p>
          )}
          {members.data?.map((m) => (
            <MemberRow
              key={m.userId}
              member={m}
              canManage={canManage}
              isSelf={m.userId === user?.id}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MemberRow({
  member,
  canManage,
  isSelf,
}: {
  member: WorkspaceMember;
  canManage: boolean;
  isSelf: boolean;
}) {
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const editable = canManage && !member.isOwner && !isSelf;

  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
        {member.name.charAt(0) || member.email.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.name}
          {isSelf && (
            <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>

      {editable ? (
        <Select
          value={member.role}
          onChange={(e) =>
            updateMember.mutate({
              userId: member.userId,
              input: { role: e.target.value as 'ADMIN' | 'MEMBER' },
            })
          }
          className="h-8 w-28"
          aria-label={`Papel de ${member.name}`}
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Membro</option>
        </Select>
      ) : (
        <Badge variant="outline" className="gap-1">
          <RoleIcon role={member.role} />
          {ROLE_LABEL[member.role]}
        </Badge>
      )}

      {editable && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Remover ${member.name}`}
          disabled={removeMember.isPending}
          onClick={() => {
            if (window.confirm(`Remover ${member.name} do workspace?`)) {
              removeMember.mutate(member.userId);
            }
          }}
        >
          <Trash2 className="size-4 text-danger" />
        </Button>
      )}
    </div>
  );
}

function InviteSection() {
  const invites = useInvites(true);
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [copied, setCopied] = useState<string | null>(null);

  const linkFor = (token: string) =>
    `${window.location.origin}/convite/${token}`;

  const copy = (token: string) => {
    void navigator.clipboard.writeText(linkFor(token));
    setCopied(token);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const handleCreate = () => {
    createInvite.mutate(
      { email: email.trim() || undefined, role },
      {
        onSuccess: (invite) => {
          setEmail('');
          copy(invite.token);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="size-4" /> Convidar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail (opcional, só como referência)"
            className="flex-1"
          />
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
            className="sm:w-32"
            aria-label="Papel do convidado"
          >
            <option value="MEMBER">Membro</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Button onClick={handleCreate} disabled={createInvite.isPending}>
            {createInvite.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            Gerar link
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Gera um link de convite (válido por 7 dias). Quem abrir o link, logado,
          entra no workspace com o papel escolhido.
        </p>

        {(invites.data?.length ?? 0) > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">
              Convites pendentes
            </p>
            {invites.data?.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"
              >
                <Badge variant="outline" className="gap-1">
                  <RoleIcon role={inv.role} />
                  {ROLE_LABEL[inv.role]}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {inv.email || 'Link de convite'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => copy(inv.token)}
                >
                  {copied === inv.token ? (
                    <>
                      <Check className="size-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copiar link
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Revogar convite"
                  disabled={revokeInvite.isPending}
                  onClick={() => revokeInvite.mutate(inv.id)}
                >
                  <X className="size-4 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
