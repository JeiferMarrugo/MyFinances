"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";
import { authCopy } from "@/lib/branding";
import { authClient, signIn } from "@/lib/auth-client";
import { resolvePasskeyUserFeedback } from "@/lib/auth/passkey-errors";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { loginSchema } from "@/lib/validations/auth";

function EmailIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8l8 5 8-5M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8M4 8l8-5 8 5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V8a4 4 0 10-8 0v3M6 11h12v9H6z"
      />
    </svg>
  );
}

function FingerprintIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11v2m0 2v2m-4-2h2m4 0h2M7 15a5 5 0 0110 0"
      />
    </svg>
  );
}

export function LoginForm({ googleAuthEnabled = false }: { googleAuthEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = authCopy.login;
  const inactivityLogout = searchParams.get("reason") === "inactivity";
  const authErrors = searchParams.getAll("error");
  const googleAuthError = authErrors.includes("google");
  const googleAccountNotLinked = authErrors.includes("account_not_linked");
  const shownAuthErrorRef = useRef<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (
      typeof PublicKeyCredential === "undefined" ||
      !PublicKeyCredential.isConditionalMediationAvailable?.()
    ) {
      return;
    }

    void authClient.signIn.passkey({ autoFill: true }).catch(() => {
      // Autofill opcional: ignorar cancelaciones y errores silenciosos.
    });
  }, []);

  useEffect(() => {
    if (!googleAuthError) return;

    const errorKey = googleAccountNotLinked
      ? "account_not_linked"
      : "google";

    if (shownAuthErrorRef.current === errorKey) return;
    shownAuthErrorRef.current = errorKey;

    if (googleAccountNotLinked) {
      appToast.error(toastCopy.auth.googleAccountNotLinkedTitle, {
        description: toastCopy.auth.googleAccountNotLinkedDescription,
      });
    } else {
      appToast.error(toastCopy.auth.googleErrorTitle, {
        description: toastCopy.auth.googleErrorDescription,
      });
    }

    router.replace("/login");
  }, [googleAuthError, googleAccountNotLinked, router]);

  function showComingSoon() {
    appToast.info(toastCopy.info.comingSoonTitle, {
      description: toastCopy.info.comingSoonDescription,
    });
  }

  async function handlePasskeySignIn() {
    setIsPasskeyLoading(true);
    const toastId = appToast.loading(toastCopy.passkey.signInLoading);

    try {
      const { error } = await authClient.signIn.passkey({
        autoFill: false,
      });

      if (error) {
        const feedback = resolvePasskeyUserFeedback(error, "sign-in");

        if (feedback) {
          appToast.error(feedback.title, {
            id: toastId,
            description: feedback.description,
          });
        } else {
          appToast.dismiss(toastId);
        }

        return;
      }

      appToast.success(toastCopy.login.successTitle, {
        id: toastId,
        description: toastCopy.login.successDescription,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const feedback = resolvePasskeyUserFeedback(error, "sign-in");

      if (feedback) {
        appToast.error(feedback.title, {
          id: toastId,
          description: feedback.description,
        });
      } else {
        appToast.dismiss(toastId);
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!googleAuthEnabled) {
      appToast.info(toastCopy.auth.googleNotConfiguredTitle, {
        description: toastCopy.auth.googleNotConfiguredDescription,
      });
      return;
    }

    setIsGoogleLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login?error=google",
      });
    } catch {
      appToast.error(toastCopy.auth.googleErrorTitle, {
        description: toastCopy.auth.googleErrorDescription,
      });
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password, rememberDevice });

    if (!result.success) {
      appToast.error(toastCopy.login.validationError, {
        description: result.error.issues[0]?.message,
      });
      return;
    }

    setIsLoading(true);
    const toastId = appToast.loading(toastCopy.login.loading);

    try {
      const response = await signIn.email({
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/dashboard",
        rememberMe: result.data.rememberDevice,
      });

      if (response.error) {
        appToast.error(toastCopy.login.errorTitle, {
          id: toastId,
          description: response.error.message ?? "Credenciales incorrectas.",
        });
        return;
      }

      appToast.success(toastCopy.login.successTitle, {
        id: toastId,
        description: toastCopy.login.successDescription,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      appToast.error(toastCopy.login.errorTitle, {
        id: toastId,
        description: toastCopy.login.connectionError,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-md"
    >
      <p className="text-sm font-semibold brand-text">{copy.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {copy.description}
      </p>

      {inactivityLogout ? (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          Tu sesión se cerró por inactividad (30 minutos). Inicia sesión de nuevo
          para continuar.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handlePasskeySignIn()}
        disabled={isPasskeyLoading}
        className="mt-8 flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-4 text-left transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <FingerprintIcon />
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.quickAccessTitle}</p>
            <p className="text-xs text-muted-foreground">
              {copy.quickAccessDescription}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold brand-text">
          {isPasskeyLoading ? "Verificando..." : `${copy.quickAccessAction} ›`}
        </span>
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-background px-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {copy.divider}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">{copy.emailLabel}</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <EmailIcon />
            </span>
            <input
              type="email"
              autoComplete="username webauthn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.emailPlaceholder}
              className="h-11 w-full rounded-xl border border-border bg-white py-2 pr-4 pl-11 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{copy.passwordLabel}</span>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              {copy.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <LockIcon />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password webauthn"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-white py-2 pr-11 pl-11 text-sm outline-none ring-ring focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(event) => setRememberDevice(event.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-accent"
          />
          {copy.rememberDevice}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <FinanceSpinnerInline label={copy.submitLoading} />
          ) : (
            copy.submit
          )}
        </button>
      </form>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {copy.socialTitle}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={isGoogleLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-medium transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="font-semibold text-[#4285F4]">G</span>
            {isGoogleLoading ? "Conectando..." : copy.socialGoogle}
          </button>
          <button
            type="button"
            onClick={showComingSoon}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-medium transition-colors hover:bg-muted/40"
          >
            <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {copy.socialApple}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.footerPrompt}{" "}
        <Link href="/register" className="font-semibold text-accent">
          {copy.footerLink}
        </Link>
      </p>
    </motion.div>
  );
}
