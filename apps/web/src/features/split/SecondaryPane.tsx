import { Suspense, useEffect } from 'react';
import {
  MemoryRouter,
  useRoutes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { appRoutes } from '@/routes';
import { navItems } from '@/app/navigation';
import { useUIStore } from '@/stores/ui';
import { Select } from '@/components/ui/select';
import { PageLoader } from '@/components/PageLoader';

/**
 * Painel secundário da tela dividida: um **roteador em memória** independente que
 * renderiza as mesmas páginas do app (via `useRoutes(appRoutes)`), com sua própria
 * navegação. Compartilha os dados (React Query/Zustand) com o painel principal.
 */
export function SecondaryPane({
  initialPath,
  onClose,
}: {
  initialPath: string;
  onClose: () => void;
}) {
  return (
    <MemoryRouter initialEntries={[initialPath || '/']}>
      <SideNavBridge />
      <div className="flex h-full flex-col">
        <SecondaryNav onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<PageLoader />}>
            <SecondaryRoutes />
          </Suspense>
        </div>
      </div>
    </MemoryRouter>
  );
}

function SecondaryRoutes() {
  return useRoutes(appRoutes);
}

/** Navega o painel secundário quando o app pede "abrir ao lado" (openInSidePanel). */
function SideNavBridge() {
  const navigate = useNavigate();
  const target = useUIStore((s) => s.sidePanelTarget);
  const nonce = useUIStore((s) => s.sidePanelNonce);
  useEffect(() => {
    if (target) navigate(target);
    // Reage a cada pedido (nonce); o alvo em si é lido no momento da navegação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);
  return null;
}

function SecondaryNav({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Módulo atual (match mais específico) para refletir no seletor.
  const current =
    [...navItems]
      .sort((a, b) => b.path.length - a.path.length)
      .find((n) =>
        n.path === '/'
          ? location.pathname === '/'
          : location.pathname === n.path ||
            location.pathname.startsWith(`${n.path}/`),
      )?.path ?? navItems[0].path;

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-3">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          title="Voltar"
          aria-label="Voltar"
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate(1)}
          title="Avançar"
          aria-label="Avançar"
          className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <Select
        value={current}
        onChange={(e) => navigate(e.target.value)}
        className="h-8 flex-1"
        aria-label="Ir para (painel secundário)"
      >
        {navItems.map((n) => (
          <option key={n.path} value={n.path}>
            {n.label}
          </option>
        ))}
      </Select>
      <button
        type="button"
        onClick={onClose}
        title="Fechar painel"
        aria-label="Fechar painel dividido"
        className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
