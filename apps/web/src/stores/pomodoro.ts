import { create } from 'zustand';

export type PomodoroMode = 'work' | 'break';

/** Durações padrão (minutos) de cada modo. */
export const POMODORO_DURATION: Record<PomodoroMode, number> = {
  work: 25 * 60,
  break: 5 * 60,
};

interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  running: boolean;
  completed: number; // pomodoros de foco concluídos
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: PomodoroMode) => void;
  /** Decrementa 1s; ao zerar, alterna o modo e conta o pomodoro de foco. */
  tick: () => void;
}

/**
 * Estado global do Pomodoro (só UI — não persiste). O tick é dirigido por um
 * único `setInterval` no PomodoroWidget (montado no Topbar, sempre presente).
 */
export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'work',
  secondsLeft: POMODORO_DURATION.work,
  running: false,
  completed: 0,

  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  reset: () =>
    set((s) => ({ running: false, secondsLeft: POMODORO_DURATION[s.mode] })),
  setMode: (mode) =>
    set({ mode, secondsLeft: POMODORO_DURATION[mode], running: false }),

  tick: () => {
    const { secondsLeft, mode, completed } = get();
    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
      return;
    }
    // Zerou: alterna o modo (foco → pausa → foco) e mantém rodando.
    const nextMode: PomodoroMode = mode === 'work' ? 'break' : 'work';
    set({
      mode: nextMode,
      secondsLeft: POMODORO_DURATION[nextMode],
      completed: mode === 'work' ? completed + 1 : completed,
    });
  },
}));
