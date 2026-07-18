import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Plus } from 'lucide-react';
import { navItems } from '@/app/navigation';
import { useUIStore } from '@/stores/ui';

/** Ações rápidas (criação) exibidas no topo da paleta. */
const quickActions = [
  { label: 'Novo estudo', path: '/estudos/novo', icon: Plus },
];

/**
 * Esqueleto da Pesquisa Global (Ctrl+K). Por enquanto navega entre os módulos;
 * quando os módulos existirem, passará a buscar projetos, estudos, bugs, notas, etc.
 */
export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const navigate = useNavigate();

  // Atalho global Ctrl+K / Cmd+K.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!useUIStore.getState().commandOpen);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Pesquisa global"
      className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl data-[state=open]:animate-in"
    >
      <div className="border-b border-border">
        <Command.Input
          placeholder="Pesquisar módulos…"
          className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
          Nenhum resultado.
        </Command.Empty>
        <Command.Group
          heading="Ações"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          {quickActions.map(({ label, path, icon: Icon }) => (
            <Command.Item
              key={path}
              value={label}
              onSelect={() => {
                navigate(path);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Módulos"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          {navItems.map(({ label, path, icon: Icon }) => (
            <Command.Item
              key={path}
              value={label}
              onSelect={() => {
                navigate(path);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
