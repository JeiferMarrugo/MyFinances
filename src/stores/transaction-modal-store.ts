import { create } from "zustand";

type TransactionModalStore = {
  isOpen: boolean;
  defaultType: "income" | "expense";
  open: (type?: "income" | "expense") => void;
  close: () => void;
};

export const useTransactionModalStore = create<TransactionModalStore>((set) => ({
  isOpen: false,
  defaultType: "expense",
  open: (type = "expense") => set({ isOpen: true, defaultType: type }),
  close: () => set({ isOpen: false }),
}));
