import { useState } from 'react';
import { Check, ChevronsUpDown, LogOut, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

/**
 * Menu de conta na Topbar: mostra o workspace ativo, permite trocar entre os
 * workspaces do usuário (recarrega os dados escopados) e fazer logout.
 */
export function WorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const workspaces = useAuthStore((s) => s.workspaces);
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAuthStore((s) => s.setActiveWorkspace);
  const logout = useAuthStore((s) => s.logout);

  const active = workspaces.find((w) => w.id === activeWorkspaceId);

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

            <div className="max-h-64 overflow-y-auto py-1">
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
    </div>
  );
}
