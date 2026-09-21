import { create } from "zustand";

type AppState = {
  sidebarCollapsed: boolean;
  balance: number;
  toggleSidebar: () => void;
  setBalance: (value: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  balance: 0,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setBalance: (value) => set({ balance: value }),
}));
