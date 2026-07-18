import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navItems } from '@/app/navigation';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import { Logo, LogoMark } from '@/components/Logo';

/** Navegação lateral entre os módulos. Colapsável (esconde os rótulos). */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        {collapsed ? <LogoMark /> : <Logo />}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
                collapsed && 'justify-center px-0',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
                )}
                <Icon
                  className={cn(
                    'relative z-10 size-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  )}
                />
                {!collapsed && <span className="relative z-10">{label}</span>}
              </>
            )}
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
