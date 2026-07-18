import { Search } from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { PomodoroWidget } from '@/features/pomodoro/PomodoroWidget';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { WorkspaceMenu } from '@/features/auth/WorkspaceMenu';

/** Barra superior com a Pesquisa Global (Ctrl+K) e o Pomodoro. */
export function Topbar() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-md border border-border bg-sidebar px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Pesquisar…</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <PomodoroWidget />
        <ThemeToggle />
        <WorkspaceMenu />
      </div>
    </header>
  );
}
