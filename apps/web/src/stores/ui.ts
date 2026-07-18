import { create } from 'zustand';

/**
 * Estado global de UI (não persiste dados de negócio — isso fica no backend).
 * Base para preferências de interface: sidebar colapsada, command palette aberta, etc.
 */
interface UIState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  /** Drawer de navegação no mobile (sidebar off-canvas). */
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  mobileNavOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
