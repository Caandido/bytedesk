import { Search, Menu, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';
import { PomodoroWidget } from '@/features/pomodoro/PomodoroWidget';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { WorkspaceMenu } from '@/features/auth/WorkspaceMenu';

/** Barra superior: hambúrguer (mobile), Pesquisa Global (Ctrl+K), Pomodoro e conta. */
export function Topbar() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const splitView = useUIStore((s) => s.splitView);
  const toggleSplitView = useUIStore((s) => s.toggleSplitView);

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:gap-4 sm:px-4">
      {/* Hambúrguer (só mobile) abre o drawer de navegação. */}
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Abrir menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
      >
        <Menu className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-sidebar px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:max-w-md"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">Pesquisar…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium sm:inline-block">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Pomodoro ocupa espaço — some nas telas mais estreitas. */}
        <div className="hidden sm:block">
          <PomodoroWidget />
        </div>
        {/* Tela dividida — só faz sentido no desktop (largura). */}
        <button
          type="button"
          onClick={toggleSplitView}
          aria-label="Dividir a tela"
          aria-pressed={splitView}
          title={splitView ? 'Fechar tela dividida' : 'Dividir a tela'}
          className={cn(
            'hidden size-9 items-center justify-center rounded-md border border-border transition-colors md:flex',
            splitView
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Columns2 className="size-4" />
        </button>
        <ThemeToggle />
        <WorkspaceMenu />
      </div>
    </header>
  );
}
