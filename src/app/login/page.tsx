import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleOneTapPrompt } from "@/components/auth/google-one-tap-prompt";
import { LoginHeader } from "@/components/auth/login-header";
import { LoginPreviewPanel } from "@/components/auth/login-preview-panel";
import { authCopy } from "@/lib/branding";
import { isGoogleAuthConfigured, isGoogleOneTapConfigured } from "@/lib/auth/providers";
import { getRequiredSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getRequiredSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex min-h-screen flex-col bg-background">
        <LoginHeader />

        <main className="flex flex-1 items-center px-6 pb-8 lg:px-10">
          <Suspense fallback={null}>
            <GoogleOneTapPrompt enabled={isGoogleOneTapConfigured()} />
            <LoginForm googleAuthEnabled={isGoogleAuthConfigured()} />
          </Suspense>
        </main>

        <footer className="border-t border-border px-6 py-4 lg:px-10">
          <p className="text-xs text-muted-foreground">{authCopy.login.securityNote}</p>
        </footer>
      </div>

      <LoginPreviewPanel />
    </div>
  );
}
