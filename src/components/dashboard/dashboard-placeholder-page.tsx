"use client";

import Link from "next/link";
import { motion } from "motion/react";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

function ConstructionIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="h-16 w-16 text-accent"
      fill="none"
    >
      <motion.path
        d="M12 46h40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.path
        d="M20 46V28l12-8 12 8v18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
      />
      <motion.path
        d="M28 46V34h8v12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
      />
      <motion.circle
        cx="32"
        cy="18"
        r="4"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.5 }}
      />
    </svg>
  );
}

export function DashboardPlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-secondary/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-secondary bg-gradient-to-br from-white to-secondary/60 shadow-sm"
        >
          <ConstructionIcon />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary/50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Próximamente
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
          className="mt-8 flex w-full max-w-md flex-col items-center gap-4"
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: "28%" }}
              animate={{ width: ["28%", "62%", "45%"] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Estamos preparando esta sección para ti
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
          className="mt-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Volver al resumen
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
