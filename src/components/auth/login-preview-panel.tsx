"use client";

import { motion } from "motion/react";
import { authCopy } from "@/lib/branding";

const decorativeBars = [42, 68, 55, 82, 48, 74, 60];

function FeatureIcon({ type }: { type: "movements" | "periods" | "dashboard" }) {
  if (type === "movements") {
    return (
      <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V8m5 12V4m5 12v-6" />
      </svg>
    );
  }

  if (type === "periods") {
    return (
      <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M6 21h12a2 2 0 002-2V7H4v12a2 2 0 002 2z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16l3-8 3 4 3-6 3 10" />
    </svg>
  );
}

const featureIcons = ["movements", "periods", "dashboard"] as const;

export function LoginPreviewPanel() {
  const copy = authCopy.login;

  return (
    <section className="login-preview-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
      <div className="login-preview-glow login-preview-glow-a" />
      <div className="login-preview-glow login-preview-glow-b" />
      <div className="login-preview-grid" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 px-12 pt-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] brand-text">
          {copy.panelEyebrow}
        </p>
        <h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight text-foreground">
          {copy.panelTitle}
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground">{copy.panelDescription}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mt-10 px-12 pb-12"
      >
        <div className="relative mx-auto max-w-md">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="login-preview-glass overflow-hidden rounded-3xl border border-white/70 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Vista general
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Tu panel financiero
                </p>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c4b5fd]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
              </div>
            </div>

            <div className="mt-6 flex h-28 items-end justify-between gap-2">
              {decorativeBars.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.08 }}
                  className={`w-full rounded-t-lg ${
                    index % 2 === 0
                      ? "bg-linear-to-t from-[#5b21b6] to-[#a78bfa]"
                      : "bg-linear-to-t from-[#059669] to-[#6ee7b7]"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-white/70 px-3 py-2 backdrop-blur-sm"
                >
                  <div className="h-1.5 w-8 rounded-full bg-secondary" />
                  <div className="mt-2 h-2 w-full rounded-full bg-secondary/80" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-4 top-8 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs font-semibold text-success">Ingresos</p>
            <div className="mt-2 h-2 w-16 rounded-full bg-emerald-100">
              <div className="h-full w-3/4 rounded-full bg-success" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-3 -left-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs font-semibold brand-text">Cuotas</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`h-2 w-2 rounded-full ${
                    dot <= 2 ? "bg-accent" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-3">
          {copy.panelFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.35 + index * 0.1 }}
              className="login-preview-feature flex items-start gap-4 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
                <FeatureIcon type={featureIcons[index] ?? "dashboard"} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
