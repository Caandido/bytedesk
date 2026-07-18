import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Users, Check, ArrowRight } from 'lucide-react';
import type { MembershipRole } from '@devflow/shared';
import { AuthShell } from '@/features/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { useInvitePreview, useAcceptInvite } from '@/features/team/useTeam';

const ROLE_LABEL: Record<MembershipRole, string> = {
  OWNER: 'Dono',
  ADMIN: 'Admin',
  MEMBER: 'Membro',
};

/** Tela de aceitar um convite (rota protegida — exige estar logado). */
export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const preview = useInvitePreview(token);
  const accept = useAcceptInvite();

  if (preview.isLoading) {
    return (
      <AuthShell title="Convite" subtitle="Verificando o convite…">
        <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      </AuthShell>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <AuthShell title="Convite inválido" subtitle="Este link não é válido.">
        <Button className="w-full" onClick={() => navigate('/')}>
          Ir para o app
        </Button>
      </AuthShell>
    );
  }

  const p = preview.data;

  if (p.alreadyMember) {
    return (
      <AuthShell
        title={p.workspaceName}
        subtitle="Você já é membro deste workspace."
      >
        <Button className="w-full" onClick={() => navigate('/')}>
          Ir para o app <ArrowRight className="size-4" />
        </Button>
      </AuthShell>
    );
  }

  if (p.expired) {
    return (
      <AuthShell
        title="Convite expirado"
        subtitle="Peça um novo link a quem te convidou."
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
        >
          Ir para o app
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Você foi convidado"
      subtitle={`${p.invitedByName} convidou você para colaborar.`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.workspaceName}</p>
            <p className="text-xs text-muted-foreground">
              Entrar como {ROLE_LABEL[p.role]}
            </p>
          </div>
        </div>

        {accept.isError && (
          <p className="text-sm text-danger">
            {(accept.error as Error).message}
          </p>
        )}

        <Button
          className="w-full"
          disabled={accept.isPending}
          onClick={() =>
            accept.mutate(token as string, {
              onSuccess: () => navigate('/'),
            })
          }
        >
          {accept.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Aceitar convite
        </Button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Agora não
        </button>
      </div>
    </AuthShell>
  );
}
