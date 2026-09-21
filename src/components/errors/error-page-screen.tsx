"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AppLogo } from "@/components/brand/app-logo";
import { ErrorIllustration } from "@/components/errors/error-illustrations";
import { ArrowLeftIcon, HomeIcon, RefreshIcon } from "@/components/errors/error-icons";
import { Button } from "@/components/ui/button";
import type { ErrorPageAction, ErrorPageConfig } from "@/lib/errors/types";

type ErrorPageScreenProps = {
  config: ErrorPageConfig;
  onRetry?: () => void;
  showLogo?: boolean;
};

function getDisplayHeadline(code: string) {
  if (code === "404") return "ERROR 404";
  return code;
}

function ActionButton({
  action,
  onRetry,
}: {
  action: ErrorPageAction;
  onRetry?: () => void;
}) {
  const icon =
    action.label.toLowerCase().includes("reintent") ? (
      <RefreshIcon className="size-4" />
    ) : action.label.toLowerCase().includes("dashboard") ||
        action.label.toLowerCase().includes("inicio") ? (
      <HomeIcon className="size-4" />
    ) : null;

  if (onRetry && action.label.toLowerCase().includes("reintent")) {
    return (
      <Button
        variant="primary"
        size="lg"
        icon={icon}
        onClick={onRetry}
        className="min-w-40 bg-white text-[#5b21b6] hover:bg-white/90"
      >
        {action.label}
      </Button>
    );
  }

  const classes =
    action.variant === "ghost"
      ? "border border-white/25 bg-white/10 text-white hover:bg-white/15"
      : action.variant === "secondary"
        ? "border border-white/35 bg-white/15 text-white hover:bg-white/25"
        : "bg-white text-[#5b21b6] hover:bg-white/90";

  return (
    <Link
      href={action.href}
      className={`inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${classes}`}
    >
      {icon}
      {action.label}
    </Link>
  );
}

export function ErrorPageScreen({
  config,
  onRetry,
  showLogo = true,
}: ErrorPageScreenProps) {
  const headline = getDisplayHeadline(config.code);
  const isGlitch = config.code === "404";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-[#5b21b6] via-[#7c3aed] to-[#4c1d95] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#a78bfa]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-[#c4b5fd]/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[#2e1065]/35" />
      </div>

      {showLogo ? (
        <div className="relative z-10 px-6 pt-6">
          <div className="[&_p]:text-white/90 [&_span]:text-white/70 [&_.brand-text]:text-white">
            <AppLogo href="/" />
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex w-full max-w-3xl flex-col items-center"
        >
          {isGlitch ? (
            <div
              data-text={headline}
              className="error-glitch-text mb-3 text-[clamp(3rem,12vw,6.5rem)] font-black leading-none tracking-tight"
            >
              {headline}
            </div>
          ) : (
            <p className="mb-2 text-[clamp(4rem,16vw,8rem)] font-black leading-none tracking-tight text-white">
              {headline}
            </p>
          )}

          <p className="text-lg font-medium text-white/90 sm:text-xl">
            {config.title}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="my-6 w-full"
          >
            <ErrorIllustration
              name={config.icon}
              className="h-52 w-full max-w-xl sm:h-72"
              priority={config.code === "404" || config.code === "500"}
            />
          </motion.div>

          <p className="max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            {config.description}
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <ActionButton action={config.primaryAction} onRetry={onRetry} />
            {config.secondaryAction ? (
              <ActionButton action={config.secondaryAction} />
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function ErrorPreviewBackLink({ href = "/dev/error-preview" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="fixed left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#2e1065]/70 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#2e1065]/90"
    >
      <ArrowLeftIcon className="size-4" />
      Galería de errores
    </Link>
  );
}
