import { PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

/**
 * Botão "abrir no painel ao lado": manda a rota `to` para o painel secundário
 * (abrindo a tela dividida se preciso). Só aparece no desktop.
 */
export function OpenInSideButton({
  to,
  className,
}: {
  to: string;
  className?: string;
}) {
  const openInSidePanel = useUIStore((s) => s.openInSidePanel);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openInSidePanel(to);
      }}
      title="Abrir no painel ao lado"
      aria-label="Abrir no painel ao lado"
      className={cn(
        'hidden size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex',
        className,
      )}
    >
      <PanelRight className="size-4" />
    </button>
  );
}
