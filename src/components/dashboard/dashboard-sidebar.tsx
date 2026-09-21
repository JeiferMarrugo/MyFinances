"use client";

import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/brand/app-logo";
import { DashboardNavLink } from "@/components/dashboard/dashboard-nav-link";
import { dashboardNavSections } from "@/lib/dashboard/navigation";
import { formatCurrency } from "@/lib/format/currency";

type DashboardSidebarProps = {
  balance: number;
  trendPercent: number | null;
  periodLabel?: string;
};

export function DashboardSidebar({
  balance,
  trendPercent,
  periodLabel,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  function isNavItemActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/manejadores") {
      return pathname === "/dashboard/manejadores";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const trendLabel =
    trendPercent === null
      ? "Sin comparación con el mes anterior"
      : trendPercent >= 0
        ? `+${trendPercent}% vs. mes anterior`
        : `${trendPercent}% vs. mes anterior`;

  const trendClass =
    trendPercent === null
      ? "text-muted-foreground"
      : trendPercent >= 0
        ? "text-success"
        : "text-destructive";

  return (
    <aside className="brand-sidebar hidden w-[17.5rem] shrink-0 flex-col lg:flex">
      <div className="brand-sidebar-header border-b border-accent/10 px-5 py-5">
        <AppLogo href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {dashboardNavSections.map((section) => (
          <div key={section.title}>
            <div className="brand-sidebar-section mb-2 px-3">
              <span>{section.title}</span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <DashboardNavLink
                  key={item.href}
                  item={item}
                  isActive={isNavItemActive(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-accent/10 p-4">
        <div className="brand-sidebar-balance brand-card-accent rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Balance del mes
            </p>
            <span className="brand-sidebar-pill">
              {periodLabel ? "Periodo actual" : "Mes actual"}
            </span>
          </div>
          <p className="brand-text mt-2 text-2xl font-bold tracking-tight">
            {formatCurrency(balance)}
          </p>
          {periodLabel ? (
            <p className="mt-1 text-[0.7rem] text-muted-foreground">{periodLabel}</p>
          ) : null}
          <p className={`mt-1.5 text-xs font-medium ${trendClass}`}>
            {trendLabel}
          </p>
        </div>
      </div>
    </aside>
  );
}
