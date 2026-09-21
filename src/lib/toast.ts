"use client";

import { createElement } from "react";
import { toast } from "sonner";
import { FinanceSpinner } from "@/components/ui/finance-spinner";

type ToastOptions = {
  description?: string;
  id?: string | number;
};

export const appToast = {
  success(title: string, options?: ToastOptions) {
    return toast.success(title, {
      description: options?.description,
      id: options?.id,
    });
  },

  error(title: string, options?: ToastOptions) {
    return toast.error(title, {
      description: options?.description,
      id: options?.id,
    });
  },

  info(title: string, options?: ToastOptions) {
    return toast.info(title, {
      description: options?.description,
      id: options?.id,
    });
  },

  loading(title: string, options?: Pick<ToastOptions, "id">) {
    return toast.loading(title, {
      id: options?.id,
      icon: createElement(FinanceSpinner, { size: "md", label: title }),
    });
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
