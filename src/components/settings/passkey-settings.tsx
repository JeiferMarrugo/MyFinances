"use client";

import { useEffect, useState } from "react";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";
import { authClient } from "@/lib/auth-client";
import { showPasskeyFeedback } from "@/lib/auth/passkey-errors";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type PasskeyItem = {
  id: string;
  name?: string | null;
  aaguid?: string | null;
  createdAt?: Date | string | null;
};

export function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPasskeys() {
    setIsLoading(true);

    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();

      if (error) {
        showPasskeyFeedback(error, "list", ({ title, description }) => {
          appToast.error(title, { description });
        });
        return;
      }

      setPasskeys(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPasskeys();
  }, []);

  async function handleRegisterPasskey() {
    setIsRegistering(true);

    try {
      const { error } = await authClient.passkey.addPasskey({
        name: "Acceso rápido MyFinances",
        authenticatorAttachment: "platform",
      });

      if (error) {
        showPasskeyFeedback(error, "register", ({ title, description }) => {
          appToast.error(title, { description });
        });
        return;
      }

      appToast.success(toastCopy.passkey.registerSuccessTitle, {
        description: toastCopy.passkey.registerSuccessDescription,
      });

      await loadPasskeys();
    } catch (error) {
      showPasskeyFeedback(error, "register", ({ title, description }) => {
        appToast.error(title, { description });
      });
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleDeletePasskey(id: string) {
    setDeletingId(id);

    try {
      const { error } = await authClient.passkey.deletePasskey({ id });

      if (error) {
        showPasskeyFeedback(error, "delete", ({ title, description }) => {
          appToast.error(title, { description });
        });
        return;
      }

      appToast.success(toastCopy.passkey.deleteSuccessTitle, {
        description: toastCopy.passkey.deleteSuccessDescription,
      });

      setPasskeys((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function getPasskeyLabel(item: PasskeyItem) {
    if (item.name?.trim()) return item.name;
    return "Passkey del dispositivo";
  }

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold brand-text">Acceso rápido</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
            Touch ID, Face ID o Passkey
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Registra este dispositivo para entrar sin contraseña. Puedes usar
            huella, reconocimiento facial o la llave de acceso del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRegisterPasskey()}
          disabled={isRegistering}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRegistering ? (
            <FinanceSpinnerInline label="Registrando passkey..." />
          ) : (
            "Registrar este dispositivo"
          )}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando passkeys...</p>
        ) : passkeys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
            Aún no tienes un passkey registrado. Agrégalo aquí después de iniciar
            sesión con tu correo o Google.
          </p>
        ) : (
          passkeys.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {getPasskeyLabel(item)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dispositivo registrado para acceso rápido
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleDeletePasskey(item.id)}
                disabled={deletingId === item.id}
                className="text-sm font-semibold text-destructive hover:underline disabled:opacity-60"
              >
                {deletingId === item.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
