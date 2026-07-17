import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react';
import { navItems } from '@/app/navigation';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';

/** Navegação lateral entre os módulos. Colapsável (esconde os rótulos). */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Zap className="size-5 shrink-0 text-primary" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">DevFlow</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggleSidebar}
        className="flex items-center gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="size-5 shrink-0" />
            <span>Recolher</span>
          </>
        )}
      </button>
    </aside>
  );
}
