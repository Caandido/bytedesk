import { create } from 'zustand';

/**
 * Estado global de UI (não persiste dados de negócio — isso fica no backend).
 * Base para preferências de interface: sidebar colapsada, command palette aberta, etc.
 */
const SPLIT_KEY = 'devflow-split';

function readSplit(): boolean {
  try {
    return localStorage.getItem(SPLIT_KEY) === '1';
  } catch {
    return false;
  }
}

function persistSplit(open: boolean): void {
  try {
    localStorage.setItem(SPLIT_KEY, open ? '1' : '0');
  } catch {
    /* localStorage indisponível */
  }
}

interface UIState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  /** Drawer de navegação no mobile (sidebar off-canvas). */
  mobileNavOpen: boolean;
  /** Tela dividida (dois painéis lado a lado). */
  splitView: boolean;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSplitView: (open: boolean) => void;
  toggleSplitView: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  mobileNavOpen: false,
  splitView: readSplit(),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSplitView: (open) => {
    persistSplit(open);
    set({ splitView: open });
  },
  toggleSplitView: () => {
    const next = !get().splitView;
    persistSplit(next);
    set({ splitView: next });
  },
}));
