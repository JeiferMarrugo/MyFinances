"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      expand
      richColors
      closeButton
      duration={4200}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[min(100vw-2rem,380px)] items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg shadow-primary/10",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          content: "flex flex-col gap-1",
          icon: "mt-0.5 shrink-0",
          closeButton:
            "absolute right-3 top-3 rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          success: "border-success/20 bg-[#f0fdf4]",
          error: "border-destructive/20 bg-[#fef2f2]",
          info: "border-accent/20 bg-secondary",
          loading: "border-border bg-card",
          warning: "border-amber-200 bg-amber-50",
        },
      }}
    />
  );
}
