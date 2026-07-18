import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Mail,
  LogOut,
  ArrowRightLeft,
  Settings,
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
  useRenameWorkspace,
  useDeleteWorkspace,
  useLeaveWorkspace,
  useTransferOwnership,
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

/** Gestão de membros do workspace ativo: papéis, convites e configurações. */
export function MembersPage() {
  const user = useAuthStore((s) => s.user);
  const workspaces = useAuthStore((s) => s.workspaces);
  const activeId = useAuthStore((s) => s.activeWorkspaceId);
  const active = workspaces.find((w) => w.id === activeId);
  const isOwner = active?.role === 'OWNER';
  const canManage = isOwner || active?.role === 'ADMIN';

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
              isOwnerViewer={isOwner}
              isSelf={m.userId === user?.id}
            />
          ))}
        </CardContent>
      </Card>

      <WorkspaceSettings isOwner={isOwner} name={active?.name ?? ''} />
    </div>
  );
}

function MemberRow({
  member,
  canManage,
  isOwnerViewer,
  isSelf,
}: {
  member: WorkspaceMember;
  canManage: boolean;
  isOwnerViewer: boolean;
  isSelf: boolean;
}) {
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const transfer = useTransferOwnership();
  const editable = canManage && !member.isOwner && !isSelf;
  const canTransfer = isOwnerViewer && !member.isOwner && !isSelf;

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

      {canTransfer && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title="Tornar dono"
          aria-label={`Transferir propriedade para ${member.name}`}
          disabled={transfer.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Transferir a propriedade do workspace para ${member.name}? Você passará a Admin.`,
              )
            ) {
              transfer.mutate(member.userId);
            }
          }}
        >
          <ArrowRightLeft className="size-4" />
        </Button>
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

  const mailto = (token: string, to: string) => {
    const link = linkFor(token);
    const subject = encodeURIComponent('Convite para o DevFlow');
    const body = encodeURIComponent(
      `Você foi convidado para colaborar no DevFlow.\n\nAbra o link para entrar:\n${link}\n`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
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
            placeholder="E-mail (opcional)"
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
                  size="icon"
                  className="size-7"
                  title="Enviar por e-mail"
                  aria-label="Enviar convite por e-mail"
                  onClick={() => mailto(inv.token, inv.email)}
                >
                  <Mail className="size-4" />
                </Button>
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
                      <Copy className="size-3.5" /> Copiar
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

function WorkspaceSettings({
  isOwner,
  name,
}: {
  isOwner: boolean;
  name: string;
}) {
  const navigate = useNavigate();
  const rename = useRenameWorkspace();
  const del = useDeleteWorkspace();
  const leave = useLeaveWorkspace();
  const [draft, setDraft] = useState(name);

  const handleRename = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) return;
    rename.mutate({ name: trimmed });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="size-4" /> Configurações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isOwner && (
          <form onSubmit={handleRename} className="space-y-2">
            <label className="text-sm font-medium">Nome do workspace</label>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={120}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={rename.isPending || draft.trim() === name}
              >
                {rename.isPending && <Loader2 className="size-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        )}

        {/* Zona de perigo */}
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          {isOwner ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Excluir workspace</p>
                <p className="text-xs text-muted-foreground">
                  Apaga o workspace e todos os seus dados. Irreversível.
                </p>
              </div>
              <Button
                variant="danger"
                disabled={del.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Excluir o workspace "${name}" e TODOS os seus dados? Esta ação é irreversível.`,
                    )
                  ) {
                    del.mutate(undefined, { onSuccess: () => navigate('/') });
                  }
                }}
              >
                <Trash2 className="size-4" /> Excluir
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Sair do workspace</p>
                <p className="text-xs text-muted-foreground">
                  Você perde o acesso a este workspace.
                </p>
              </div>
              <Button
                variant="danger"
                disabled={leave.isPending}
                onClick={() => {
                  if (window.confirm(`Sair do workspace "${name}"?`)) {
                    leave.mutate(undefined, { onSuccess: () => navigate('/') });
                  }
                }}
              >
                <LogOut className="size-4" /> Sair
              </Button>
            </div>
          )}
          {(del.isError || leave.isError) && (
            <p className="mt-2 text-sm text-danger">
              {((del.error ?? leave.error) as Error).message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
