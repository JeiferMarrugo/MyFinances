"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/brand/app-logo";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";
import { authCopy } from "@/lib/branding";
import { signUp } from "@/lib/auth-client";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const copy = authCopy.register;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      appToast.error(toastCopy.register.validationError, {
        description: result.error.issues[0]?.message,
      });
      return;
    }

    setIsLoading(true);
    const toastId = appToast.loading(toastCopy.register.loading);

    try {
      const response = await signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/dashboard",
      });

      if (response.error) {
        appToast.error(toastCopy.register.errorTitle, {
          id: toastId,
          description: response.error.message ?? "Intenta con otro correo.",
        });
        return;
      }

      appToast.success(toastCopy.register.successTitle, {
        id: toastId,
        description: toastCopy.register.successDescription,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      appToast.error(toastCopy.register.errorTitle, {
        id: toastId,
        description: toastCopy.register.connectionError,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mb-10">
          <AppLogo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md"
        >
          <p className="text-sm font-medium text-accent">{copy.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Nombre</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Correo electrónico</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Contraseña</span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Confirmar contraseña</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {copy.footerPrompt}{" "}
            <Link href="/login" className="font-semibold text-accent">
              {copy.footerLink}
            </Link>
          </p>
        </motion.div>
      </section>

      <section className="hidden bg-linear-to-br from-secondary via-white to-[#f3e8ff] p-12 lg:flex lg:flex-col lg:justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.panelEyebrow}
        </p>
        <h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
          {copy.panelTitle}
        </h2>
        <p className="mt-4 max-w-lg text-muted-foreground">
          {copy.panelDescription}
        </p>
      </section>
    </div>
  );
}
