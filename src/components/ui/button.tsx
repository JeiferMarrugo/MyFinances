import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FinanceSpinnerInline } from "@/components/ui/finance-spinner";

const variantClasses = {
  primary:
    "brand-gradient brand-gradient-hover brand-glow-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-accent/30",
  secondary:
    "brand-gradient-soft border border-accent/15 text-accent brand-glow-sm hover:border-accent/30 focus-visible:ring-2 focus-visible:ring-accent/20",
  outline:
    "border border-accent/15 bg-white text-foreground hover:border-accent/30 hover:bg-secondary/30 focus-visible:ring-2 focus-visible:ring-accent/20",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
  success:
    "bg-[#ecfdf5] text-success shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  accent:
    "border border-accent/20 bg-linear-to-br from-secondary/80 to-white text-accent hover:border-accent/35 hover:shadow-[0_6px_18px_-10px_rgba(124,58,237,0.35)] focus-visible:ring-2 focus-visible:ring-accent/20",
  destructive:
    "bg-destructive text-white shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  "destructive-soft":
    "border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring",
} as const;

const sizeClasses = {
  sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold",
  md: "h-10 gap-2 rounded-xl px-4 text-sm font-semibold",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm font-semibold",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  icon,
  fullWidth = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-colors outline-none disabled:pointer-events-none disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <FinanceSpinnerInline label={loadingLabel ?? "Cargando..."} />
      ) : (
        <>
          {icon ? <span className="shrink-0">{icon}</span> : null}
          {children}
        </>
      )}
    </button>
  );
}
