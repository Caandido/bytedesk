import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronsUpDown,
  LogOut,
  Building2,
  Users,
  Plus,
  Loader2,
  DoorOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateWorkspace, useLeaveWorkspace } from '@/features/team/useTeam';

/**
 * Menu de conta na Topbar: mostra o workspace ativo, permite trocar entre os
 * workspaces do usuário, criar um novo, gerir membros e fazer logout.
 */
export function WorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const workspaces = useAuthStore((s) => s.workspaces);
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAuthStore((s) => s.setActiveWorkspace);
  const logout = useAuthStore((s) => s.logout);

  const leaveWorkspace = useLeaveWorkspace();
  const active = workspaces.find((w) => w.id === activeWorkspaceId);
  const canLeave = Boolean(active) && active?.role !== 'OWNER';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Building2 className="size-4 text-muted-foreground" />
        <span className="max-w-[10rem] truncate font-medium">
          {active?.name ?? 'Workspace'}
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/* Backdrop para fechar ao clicar fora. */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <div className="max-h-52 overflow-y-auto py-1">
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Workspaces
              </p>
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={w.id === activeWorkspaceId}
                  onClick={() => {
                    setActiveWorkspace(w.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 truncate">
                    {w.name}
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      {w.role === 'OWNER' ? 'dono' : w.role.toLowerCase()}
                    </span>
                  </span>
                  <Check
                    className={cn(
                      'size-4 shrink-0 text-foreground',
                      w.id === activeWorkspaceId ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="border-t border-border py-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <Plus className="size-4" />
                Criar workspace
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate('/membros');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <Users className="size-4" />
                Membros e tokens
              </button>
              {canLeave && (
                <button
                  type="button"
                  role="menuitem"
                  disabled={leaveWorkspace.isPending}
                  onClick={() => {
                    if (
                      window.confirm(`Sair do workspace "${active?.name}"?`)
                    ) {
                      setOpen(false);
                      leaveWorkspace.mutate();
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <DoorOpen className="size-4" />
                  Sair do workspace
                </button>
              )}
            </div>

            <div className="border-t border-border py-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-accent"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

function CreateWorkspaceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createWorkspace.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          onClose();
          navigate('/');
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Criar workspace">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Nome do workspace</Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Time do App, Freelas, Estudos…"
            maxLength={120}
            autoFocus
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Um workspace novo começa vazio e isolado. Você entra como dono e pode
          convidar outras pessoas.
        </p>
        {createWorkspace.isError && (
          <p className="text-sm text-danger">
            {(createWorkspace.error as Error).message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Criar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
