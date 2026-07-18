import { useEffect, useId, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Renderiza um diagrama Mermaid a partir do texto. O pacote `mermaid` é pesado, então
 * é carregado sob demanda (import dinâmico) — só baixa quando há um diagrama na página.
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    let active = true;
    setError(null);
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
        });
        const { svg } = await mermaid.render(`mmd-${rawId}`, chart.trim());
        if (active) setSvg(svg);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Diagrama inválido.');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [chart, rawId]);

  if (error) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md border border-danger/40 bg-danger/5 p-3 text-xs text-danger">
        Erro no diagrama Mermaid: {error}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="my-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Renderizando diagrama…
      </div>
    );
  }

  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-md border border-border bg-card p-3 [&_svg]:max-w-full"
      // O SVG vem do mermaid com securityLevel 'strict' (sanitizado).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
