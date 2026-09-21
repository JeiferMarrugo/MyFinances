"use client";

import { useState } from "react";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";
import { authClient } from "@/lib/auth-client";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type GoogleAccountSettingsProps = {
  enabled: boolean;
};

export function GoogleAccountSettings({ enabled }: GoogleAccountSettingsProps) {
  const [isLinking, setIsLinking] = useState(false);

  async function handleLinkGoogle() {
    if (!enabled) {
      appToast.info(toastCopy.auth.googleNotConfiguredTitle, {
        description: toastCopy.auth.googleNotConfiguredDescription,
      });
      return;
    }

    setIsLinking(true);

    try {
      await authClient.linkSocial({
        provider: "google",
        callbackURL: "/dashboard/configuracion",
      });
    } catch {
      appToast.error(toastCopy.auth.googleErrorTitle, {
        description: toastCopy.auth.googleErrorDescription,
      });
      setIsLinking(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold brand-text">Cuenta Google</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
            Inicio de sesión con Google
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Vincula tu cuenta de Google para entrar más rápido con el mismo
            correo que usas en MyFinances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleLinkGoogle()}
          disabled={isLinking}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLinking ? (
            <FinanceSpinnerInline label="Conectando Google..." />
          ) : (
            <>
              <span className="font-bold text-[#4285F4]">G</span>
              Vincular Google
            </>
          )}
        </button>
      </div>
    </section>
  );
}
