"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";
import { useSignOut } from "@/hooks/use-sign-out";

type UserMenuProps = {
  userName: string;
  userEmail: string;
};

export function UserMenu({ userName, userEmail }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleSignOut, isLoading } = useSignOut();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function onSignOut() {
    setIsOpen(false);
    await handleSignOut();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2 transition-colors hover:bg-muted/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-accent">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden text-left sm:block">
          <p className="max-w-[160px] truncate text-sm font-semibold leading-none">
            {userName}
          </p>
          <p className="mt-1 max-w-[160px] truncate text-xs text-muted-foreground">
            {userEmail}
          </p>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border bg-secondary/40 px-4 py-3">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard/configuracion"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="h-4 w-4 text-muted-foreground"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.865 1.078l1.597-.633a1 1 0 011.322.949l.018 1.392a1 1 0 01-.632.984l-1.597.633a6.993 6.993 0 010 3.718l1.597.633a1 1 0 01.632.984l-.018 1.392a1 1 0 01-1.322.949l-1.597-.633a6.993 6.993 0 01-1.865 1.078l-.331 1.652a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.865-1.078l-1.597.633a1 1 0 01-1.322-.949l-.018-1.392a1 1 0 01.632-.984l1.597-.633a6.993 6.993 0 010-3.718l-1.597-.633a1 1 0 01-.632-.984l.018-1.392a1 1 0 011.322-.949l1.597.633A6.993 6.993 0 018.01 3.456l.331-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Configuración
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={isLoading}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-70"
            >
              {isLoading ? (
                <FinanceSpinnerInline label="Cerrando sesión..." />
              ) : (
                <>
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cerrar sesión
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
