"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import {
  useConfirmDialogStore,
  type ConfirmDialogOptions,
} from "@/stores/confirm-dialog-store";

function ConfirmIcon({ variant }: { variant: ConfirmDialogOptions["variant"] }) {
  if (variant === "destructive") {
    return (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fef2f2] text-destructive">
        <TrashIcon className="size-6" />
      </div>
    );
  }

  return (
    <div className="brand-logo flex size-12 items-center justify-center rounded-2xl text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    </div>
  );
}

export function ConfirmDialog() {
  const isOpen = useConfirmDialogStore((state) => state.isOpen);
  const options = useConfirmDialogStore((state) => state.options);
  const close = useConfirmDialogStore((state) => state.close);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, isOpen]);

  if (!isOpen || !options) return null;

  const variant = options.variant ?? "destructive";
  const confirmLabel = options.confirmLabel ?? "Confirmar";
  const cancelLabel = options.cancelLabel ?? "Cancelar";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <motion.button
        type="button"
        aria-label="Cerrar diálogo"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => close(false)}
      />

      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        <div className="flex items-start gap-4">
          <ConfirmIcon variant={variant} />
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {options.title}
            </h2>
            <p
              id="confirm-dialog-description"
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              {options.description}
              {options.highlight ? (
                <>
                  {" "}
                  <span className="font-semibold text-foreground">
                    “{options.highlight}”
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => close(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "primary"}
            size="lg"
            onClick={() => close(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
