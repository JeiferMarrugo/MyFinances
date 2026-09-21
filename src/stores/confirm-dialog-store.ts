import { create } from "zustand";

export type ConfirmDialogOptions = {
  title: string;
  description: string;
  highlight?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
};

type ConfirmDialogState = {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  resolve: ((value: boolean) => void) | null;
  open: (options: ConfirmDialogOptions) => Promise<boolean>;
  close: (confirmed: boolean) => void;
};

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,
  open: (options) =>
    new Promise((resolve) => {
      set({ isOpen: true, options, resolve });
    }),
  close: (confirmed) => {
    get().resolve?.(confirmed);
    set({ isOpen: false, options: null, resolve: null });
  },
}));

export function appConfirm(options: ConfirmDialogOptions): Promise<boolean> {
  return useConfirmDialogStore.getState().open(options);
}
