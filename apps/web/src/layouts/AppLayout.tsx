import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/features/command-palette/CommandPalette';
import { PageLoader } from '@/components/PageLoader';
import { SplitLayout } from '@/features/split/SplitLayout';
import { useUIStore } from '@/stores/ui';

/** Shell da aplicação: Sidebar + Topbar + área de conteúdo (rotas). */
export function AppLayout() {
  const location = useLocation();
  const splitView = useUIStore((s) => s.splitView);
  const toggleSplitView = useUIStore((s) => s.toggleSplitView);

  // Atalho Ctrl+\ (ou ⌘\) para dividir/fechar a tela.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        toggleSplitView();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSplitView]);

  const primary = (
    <Suspense fallback={<PageLoader />}>
      {/* Transição suave a cada mudança de rota. */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.div>
    </Suspense>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden">
          {splitView ? (
            <SplitLayout primary={primary} primaryPath={location.pathname} />
          ) : (
            <div className="h-full overflow-y-auto p-4 sm:p-6">{primary}</div>
          )}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
