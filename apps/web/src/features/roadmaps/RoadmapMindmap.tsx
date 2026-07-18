import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoadmapTemplateDetail } from '@devflow/shared';
import { MermaidDiagram } from '@/components/MermaidDiagram';

/** Sanitiza um rótulo para caber num label do Mermaid entre aspas. */
const label = (s: string) =>
  s.replace(/"/g, "'").replace(/[[\]{}]/g, '').slice(0, 48);

/** Gera um grafo Mermaid (roadmap vertical) a partir do template. */
function buildGraph(template: RoadmapTemplateDetail): string {
  const lines = ['graph TD'];
  lines.push(`  ROOT(["${label(template.name)}"]):::root`);
  let prev = 'ROOT';
  template.items.forEach((item, i) => {
    const id = `N${i}`;
    lines.push(`  ${prev} --> ${id}["${label(item.title)}"]`);
    if (item.linkTo) {
      // Nó clicável → roadmap dedicado (interceptado para navegação SPA).
      lines.push(
        `  click ${id} href "/roadmaps/guia/${item.linkTo}" "Abrir roadmap dedicado"`,
      );
      lines.push(`  class ${id} linked`);
    }
    prev = id;
  });
  lines.push(
    '  classDef root fill:#FAFAFA,stroke:#FAFAFA,color:#0A0A0A,font-weight:bold',
  );
  lines.push(
    '  classDef linked fill:#1f1f1f,stroke:#FAFAFA,color:#FAFAFA,stroke-width:2px',
  );
  return lines.join('\n');
}

/**
 * Mapa mental visual de um roadmap (Mermaid). Nós verdes têm roadmap dedicado —
 * clicar redireciona (navegação SPA, estilo Obsidian).
 */
export function RoadmapMindmap({
  template,
}: {
  template: RoadmapTemplateDetail;
}) {
  const navigate = useNavigate();

  // Intercepta cliques nos links internos do SVG para navegar sem recarregar.
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href =
      anchor.getAttribute('href') || anchor.getAttribute('xlink:href');
    if (href && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <div onClick={handleClick} className="[&_a]:cursor-pointer">
      <MermaidDiagram
        chart={buildGraph(template)}
        securityLevel="loose"
        className="max-h-[70vh]"
      />
    </div>
  );
}
