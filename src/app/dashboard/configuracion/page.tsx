import { DevErrorPreviewLink } from "@/components/dev/dev-error-preview-link";
import { FinancePeriodSettings } from "@/components/settings/finance-period-settings";
import { GoogleAccountSettings } from "@/components/settings/google-account-settings";
import { PasskeySettings } from "@/components/settings/passkey-settings";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { isGoogleAuthConfigured } from "@/lib/auth/providers";
import { getRequiredPageSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getRequiredPageSession();
  const settings = await getOrCreateFinanceSettings(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold brand-text">Configuración</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          Cuenta y periodos
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Administra tu acceso rápido y define cómo se organizan tus quincenas,
          meses, trimestres y años en la app.
        </p>
      </div>

      <PasskeySettings />

      <GoogleAccountSettings enabled={isGoogleAuthConfigured()} />

      <FinancePeriodSettings initialSettings={settings} />

      <DevErrorPreviewLink />
    </div>
  );
}
