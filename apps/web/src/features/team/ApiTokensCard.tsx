import { useState } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  Trash2,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import type { ApiTokenCreated } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useApiTokens,
  useCreateApiToken,
  useRevokeApiToken,
} from '@/features/team/useTeam';

/** Tokens de API pessoais (para a extensão do VSCode / integrações). */
export function ApiTokensCard() {
  const tokens = useApiTokens();
  const createToken = useCreateApiToken();
  const revokeToken = useRevokeApiToken();
  const [name, setName] = useState('');
  const [created, setCreated] = useState<ApiTokenCreated | null>(null);
  const [copied, setCopied] = useState(false);

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createToken.mutate(trimmed, {
      onSuccess: (t) => {
        setCreated(t);
        setName('');
      },
    });
  };

  const copy = () => {
    if (!created) return;
    void navigator.clipboard.writeText(created.token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4" /> Tokens de API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use na <strong>extensão do VSCode</strong> (ou outras integrações) em vez
          da senha. Cada token já embute <em>este</em> workspace.
        </p>

        {created ? (
          <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium">
              Copie o token agora — ele não será exibido de novo.
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 font-mono text-xs">
                {created.token}
              </code>
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? (
                  <>
                    <Check className="size-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copiar
                  </>
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                aria-label="Fechar"
                onClick={() => setCreated(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do token (ex.: VSCode do notebook)"
              maxLength={120}
              className="flex-1"
            />
            <Button onClick={create} disabled={createToken.isPending || !name.trim()}>
              {createToken.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Gerar token
            </Button>
          </div>
        )}

        {(tokens.data?.length ?? 0) > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            {tokens.data?.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"
              >
                <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.lastUsedAt
                      ? `usado por último em ${new Date(t.lastUsedAt).toLocaleDateString('pt-BR')}`
                      : 'nunca usado'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Revogar ${t.name}`}
                  disabled={revokeToken.isPending}
                  onClick={() => {
                    if (window.confirm(`Revogar o token "${t.name}"?`)) {
                      revokeToken.mutate(t.id);
                    }
                  }}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
