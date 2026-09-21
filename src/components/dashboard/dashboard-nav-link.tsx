"use client";

import Link from "next/link";
import { DashboardNavIcon } from "@/components/dashboard/nav-icons";
import type { DashboardNavItem } from "@/lib/dashboard/navigation";

type DashboardNavLinkProps = {
  item: DashboardNavItem;
  isActive: boolean;
};

export function DashboardNavLink({ item, isActive }: DashboardNavLinkProps) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`brand-nav-link group ${isActive ? "brand-nav-link-active" : ""}`}
    >
      <span
        className={`brand-nav-icon ${isActive ? "brand-nav-icon-active" : ""}`}
      >
        <DashboardNavIcon name={item.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {isActive ? <span className="brand-nav-dot" aria-hidden="true" /> : null}
    </Link>
  );
}
