import type { ReactNode } from "react";
import type { ErrorPageIcon } from "@/lib/errors/types";

type ErrorIconProps = {
  name: ErrorPageIcon;
  className?: string;
};

function IconShell({
  className = "size-8",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
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

export function ErrorPageIconGraphic({ name, className }: ErrorIconProps) {
  switch (name) {
    case "not-found":
      return (
        <IconShell className={className}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4.2-4.2" />
          <path d="M11 8v6M8 11h6" strokeWidth="1.5" />
        </IconShell>
      );
    case "unauthorized":
      return (
        <IconShell className={className}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
        </IconShell>
      );
    case "forbidden":
      return (
        <IconShell className={className}>
          <path d="M12 3 4 7v6c0 5 3.5 7.7 8 9 4.5-1.3 8-4 8-9V7l-8-4Z" />
          <path d="m9.5 12.5 5 5M14.5 12.5l-5 5" />
        </IconShell>
      );
    case "server":
      return (
        <IconShell className={className}>
          <rect x="4" y="4" width="16" height="6" rx="1.5" />
          <rect x="4" y="14" width="16" height="6" rx="1.5" />
          <path d="M8 7h.01M8 17h.01" strokeWidth="2.5" />
          <path d="M12 10v4M10 12h4" />
        </IconShell>
      );
    case "maintenance":
      return (
        <IconShell className={className}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
        </IconShell>
      );
    case "rate-limit":
      return (
        <IconShell className={className}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2.5" />
          <path d="M9 3h6" />
        </IconShell>
      );
    case "offline":
      return (
        <IconShell className={className}>
          <path d="M12 20h.01" strokeWidth="2.5" />
          <path d="M8.5 16.429a5 5 0 0 1 7 0" />
          <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
          <path d="M19 12.859a10 10 0 0 0-2.5-1.866" />
          <path d="m2 2 20 20" />
        </IconShell>
      );
    case "session":
      return (
        <IconShell className={className}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
          <path d="M9 3h6" />
        </IconShell>
      );
    case "gateway":
      return (
        <IconShell className={className}>
          <path d="M4 7h16v10H4z" />
          <path d="M9 12h6M12 9v6" />
          <path d="M2 12h2M20 12h2" />
        </IconShell>
      );
    default:
      return (
        <IconShell className={className}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" strokeWidth="2.5" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </IconShell>
      );
  }
}

export function ArrowLeftIcon({ className = "size-4" }: { className?: string }) {
  return (
    <IconShell className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </IconShell>
  );
}

export function RefreshIcon({ className = "size-4" }: { className?: string }) {
  return (
    <IconShell className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </IconShell>
  );
}

export function HomeIcon({ className = "size-4" }: { className?: string }) {
  return (
    <IconShell className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </IconShell>
  );
}
