import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useUIStore } from '@/stores/ui';
import { SecondaryPane } from './SecondaryPane';

/**
 * Tela dividida: painel principal (rota do app) à esquerda e um painel secundário
 * independente à direita, com um divisor arrastável para redimensionar.
 */
export function SplitLayout({
  primary,
  primaryPath,
}: {
  primary: ReactNode;
  primaryPath: string;
}) {
  const setSplitView = useUIStore((s) => s.setSplitView);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [leftPct, setLeftPct] = useState(50);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex h-full">
      <div
        className="h-full overflow-y-auto p-4 sm:p-6"
        style={{ width: `${leftPct}%` }}
      >
        {primary}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar painéis"
        onPointerDown={() => {
          dragging.current = true;
          document.body.style.userSelect = 'none';
        }}
        className="w-1.5 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-foreground/30"
      />

      <div className="h-full min-w-0 flex-1 border-l border-border">
        <SecondaryPane
          initialPath={primaryPath}
          onClose={() => setSplitView(false)}
        />
      </div>
    </div>
  );
}
