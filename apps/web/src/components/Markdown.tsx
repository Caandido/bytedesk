import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';
import { MermaidDiagram } from '@/components/MermaidDiagram';

/** Extrai o texto cru de um nó hast (independente dos spans do realce). */
function nodeText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] };
  if (!n) return '';
  if (typeof n.value === 'string') return n.value;
  if (Array.isArray(n.children)) return n.children.map(nodeText).join('');
  return '';
}

/** Renderiza blocos ```mermaid como diagrama; o resto como código normal. */
const markdownComponents: Components = {
  code({ className, children, node, ...props }) {
    if (/\blanguage-mermaid\b/.test(className ?? '')) {
      return <MermaidDiagram chart={nodeText(node)} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renderiza texto Markdown (GFM: tabelas, checklists, ~~riscado~~) com o visual do
 * app. Reutilizável por todos os módulos que têm anotações/documentação em Markdown.
 * Estiliza os elementos via seletores no container (sem o plugin de typography).
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'text-sm leading-relaxed text-foreground',
        '[&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-bold',
        '[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold',
        '[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold',
        '[&_p]:my-2',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
        '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
        '[&_li]:my-1',
        '[&_a]:text-info [&_a]:underline [&_a]:underline-offset-2',
        '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
        // Bloco de código sempre escuro (github-dark) — legível em ambos os temas.
        '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#0d1117] [&_pre]:p-3',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs',
        '[&_pre_code.hljs]:bg-transparent',
        '[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left',
        '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5',
        '[&_hr]:my-4 [&_hr]:border-border',
        '[&_input]:mr-1 [&_input]:align-middle',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
