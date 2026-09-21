"use client";

import { motion } from "motion/react";

const sizeMap = {
  sm: {
    box: "h-6 w-6",
    radius: 9,
    icon: "h-2.5 w-2.5",
    badge: "h-4 w-4 text-[0.45rem]",
    showCenter: false,
  },
  md: {
    box: "h-10 w-10",
    radius: 15,
    icon: "h-3 w-3",
    badge: "h-6 w-6 text-[0.5rem]",
    showCenter: true,
  },
  lg: {
    box: "h-16 w-16",
    radius: 24,
    icon: "h-4 w-4",
    badge: "h-8 w-8 text-[0.6rem]",
    showCenter: true,
  },
} as const;

type FinanceSpinnerProps = {
  size?: keyof typeof sizeMap;
  className?: string;
  label?: string;
};

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8h13a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z"
      />
      <path strokeLinecap="round" d="M16 12h4v4h-4a1 1 0 010-2z" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v8M9.5 10.5h5M9.5 13.5h5" />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path strokeLinecap="round" d="M3 10h18M7 15h4" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V9M12 19V5M19 19v-7" />
    </svg>
  );
}

const orbitIcons = [
  { Icon: WalletIcon, color: "text-accent bg-secondary" },
  { Icon: CoinIcon, color: "text-[#059669] bg-[#ecfdf5]" },
  { Icon: CardIcon, color: "text-primary bg-[#ede9fe]" },
  { Icon: ChartIcon, color: "text-[#7c3aed] bg-[#f3e8ff]" },
] as const;

export function FinanceSpinner({
  size = "md",
  className,
  label = "Cargando",
}: FinanceSpinnerProps) {
  const config = sizeMap[size];

  return (
    <div
      role="status"
      aria-label={label}
      className={`relative inline-flex shrink-0 items-center justify-center ${config.box} ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-accent/35"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
      >
        {orbitIcons.map(({ Icon, color }, index) => {
          const angle = (index / orbitIcons.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * config.radius;
          const y = Math.sin(angle) * config.radius;

          return (
            <motion.span
              key={index}
              className={`absolute flex items-center justify-center rounded-full shadow-sm ${config.badge} ${color}`}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.12,
                ease: "easeInOut",
              }}
            >
              <Icon className={config.icon} />
            </motion.span>
          );
        })}
      </motion.div>

      {config.showCenter ? (
        <motion.span
          className="relative z-10 flex h-[34%] w-[34%] min-h-3 min-w-3 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
          animate={{ scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          M
        </motion.span>
      ) : null}
    </div>
  );
}

export function FinanceSpinnerInline({
  label,
  size = "sm",
}: {
  label: string;
  size?: keyof typeof sizeMap;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2.5">
      <FinanceSpinner size={size} label={label} />
      <span>{label}</span>
    </span>
  );
}
