import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconBase({
  className = "size-5",
  children,
}: IconProps & { children: React.ReactNode }) {
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

export function ReportChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 17V9M12 17V7M16 17v-5" />
    </IconBase>
  );
}

export function ReportCompareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 3v18" />
      <path d="M16 3v18" />
      <path d="M3 8h5M3 16h5M16 12h5" />
    </IconBase>
  );
}

export function ReportIncomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2v20" />
      <path d="M17 7l-5-5-5 5" />
    </IconBase>
  );
}

export function ReportExpenseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 22V2" />
      <path d="M17 17l-5 5-5-5" />
    </IconBase>
  );
}

export function ReportBalanceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" />
      <path d="M8 7h8M8 12h8M8 17h5" />
    </IconBase>
  );
}

export function ReportCreditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </IconBase>
  );
}

export function ReportCategoryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h7l2 2h7v8H4z" />
    </IconBase>
  );
}

export function ReportMerchantIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10 12 4l8 6" />
      <path d="M6 10v9h12v-9" />
    </IconBase>
  );
}

export function ReportFixedIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
    </IconBase>
  );
}

export function ReportProjectionIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 3 3 5-6" />
    </IconBase>
  );
}

export function ReportWalletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
      <path d="M17 12h4v4h-4a2 2 0 1 1 0-4Z" />
    </IconBase>
  );
}

export function ReportSavingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </IconBase>
  );
}

export function ReportRecurringIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 3" />
    </IconBase>
  );
}

export function ReportCsvIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h2M8 17h8M8 9h1" />
    </IconBase>
  );
}

export function ReportExcelIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="m8 13 3 4 3-4M8 17h6" />
    </IconBase>
  );
}

export function ReportPdfIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M10 12h4M10 16h4M10 12v4" />
    </IconBase>
  );
}

export function ReportAlertWarningIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" strokeWidth="2.5" />
    </IconBase>
  );
}

export function ReportAlertSuccessIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </IconBase>
  );
}

export function ReportAlertInfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" strokeWidth="2.5" />
    </IconBase>
  );
}

export function ReportCalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </IconBase>
  );
}
