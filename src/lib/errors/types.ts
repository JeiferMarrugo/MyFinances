export type ErrorPageIcon =
  | "not-found"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "maintenance"
  | "rate-limit"
  | "offline"
  | "session"
  | "gateway"
  | "generic";

export type ErrorPageTone = "brand" | "danger" | "warning" | "neutral";

export type ErrorPageAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type ErrorPageConfig = {
  code: string;
  icon: ErrorPageIcon;
  tone: ErrorPageTone;
  title: string;
  description: string;
  hint?: string;
  primaryAction: ErrorPageAction;
  secondaryAction?: ErrorPageAction;
};
