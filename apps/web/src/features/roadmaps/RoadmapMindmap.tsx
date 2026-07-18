import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MermaidDiagram } from '@/components/MermaidDiagram';

/** Um nó do mapa mental (item de trilha). */
export interface MindmapNode {
  title: string;
  /** id de outro roadmap do catálogo (cross-link estilo Obsidian). */
  linkTo?: string;
  /** marca visual de concluído (roadmaps do usuário). */
  done?: boolean;
}

/** Sanitiza um rótulo para caber num label do Mermaid entre aspas. */
const label = (s: string) =>
  s.replace(/"/g, "'").replace(/[[\]{}]/g, '').slice(0, 48);

/** Gera um grafo Mermaid (roadmap vertical) a partir do nome + itens. */
function buildGraph(name: string, items: MindmapNode[]): string {
  const lines = ['graph TD'];
  lines.push(`  ROOT(["${label(name)}"]):::root`);
  let prev = 'ROOT';
  items.forEach((item, i) => {
    const id = `N${i}`;
    lines.push(`  ${prev} --> ${id}["${label(item.title)}"]`);
    const classes: string[] = [];
    if (item.linkTo) {
      // Nó clicável → roadmap dedicado (interceptado para navegação SPA).
      lines.push(
        `  click ${id} href "/roadmaps/guia/${item.linkTo}" "Abrir roadmap dedicado"`,
      );
      classes.push('linked');
    }
    if (item.done) classes.push('done');
    if (classes.length) lines.push(`  class ${id} ${classes.join(',')}`);
    prev = id;
  });
  lines.push(
    '  classDef root fill:#FAFAFA,stroke:#FAFAFA,color:#0A0A0A,font-weight:bold',
  );
  lines.push(
    '  classDef linked fill:#1f1f1f,stroke:#FAFAFA,color:#FAFAFA,stroke-width:2px',
  );
  lines.push('  classDef done fill:#0A0A0A,stroke:#3F3F3F,color:#8A8A8A');
  return lines.join('\n');
}

/**
 * Mapa mental visual de um roadmap (Mermaid). Serve tanto para os guias do
 * catálogo (nós em destaque têm roadmap dedicado — clicar redireciona, estilo
 * Obsidian) quanto para os roadmaps do próprio usuário (itens concluídos ficam
 * esmaecidos).
 */
export function RoadmapMindmap({
  name,
  items,
}: {
  name: string;
  items: MindmapNode[];
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
        chart={buildGraph(name, items)}
        securityLevel="loose"
        className="max-h-[70vh]"
      />
    </div>
  );
}
