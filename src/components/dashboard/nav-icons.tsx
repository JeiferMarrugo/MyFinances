import type { ReactNode } from "react";

type NavIconProps = {
  className?: string;
};

function IconBase({
  className = "size-[18px]",
  children,
}: NavIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function DashboardNavIcon({
  name,
  className,
}: NavIconProps & { name: string }) {
  switch (name) {
    case "overview":
      return (
        <IconBase className={className}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </IconBase>
      );
    case "transactions":
      return (
        <IconBase className={className}>
          <path d="M7 7h10M7 12h6M7 17h8" />
          <path d="M17 10v8M14 13l3 3 3-3" />
        </IconBase>
      );
    case "budgets":
      return (
        <IconBase className={className}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15V9M12 17v-6M16 13V7" />
        </IconBase>
      );
    case "goals":
      return (
        <IconBase className={className}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </IconBase>
      );
    case "loans":
      return (
        <IconBase className={className}>
          <path d="M12 3v18" />
          <path d="M7 8c0-2.2 2.2-4 5-4s5 1.8 5 4-2.2 4-5 4" />
          <path d="M7 16c0 2.2 2.2 4 5 4s5-1.8 5-4-2.2-4-5-4" />
        </IconBase>
      );
    case "managers":
      return (
        <IconBase className={className}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </IconBase>
      );
    case "merchants":
      return (
        <IconBase className={className}>
          <path d="M4 10 12 4l8 6" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-4h4v4" />
        </IconBase>
      );
    case "services":
      return (
        <IconBase className={className}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </IconBase>
      );
    case "cards":
      return (
        <IconBase className={className}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </IconBase>
      );
    case "banks":
      return (
        <IconBase className={className}>
          <path d="M3 10h18" />
          <path d="M5 10V19M9 10v9M15 10v9M19 10v9" />
          <path d="M4 19h16" />
          <path d="M12 3 3 8h18L12 3Z" />
        </IconBase>
      );
    case "reports":
      return (
        <IconBase className={className}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 17V9M12 17V7M16 17v-5" />
        </IconBase>
      );
    case "settings":
      return (
        <IconBase className={className}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36 0 .7.07 1 .2H21a2 2 0 1 1 0 4h-.09c-.67.05-1.24.43-1.51 1Z" />
        </IconBase>
      );
    default:
      return (
        <IconBase className={className}>
          <circle cx="12" cy="12" r="4" />
        </IconBase>
      );
  }
}
