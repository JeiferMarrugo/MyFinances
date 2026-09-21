export type NavIconName =
  | "overview"
  | "transactions"
  | "budgets"
  | "goals"
  | "loans"
  | "managers"
  | "merchants"
  | "services"
  | "cards"
  | "banks"
  | "reports"
  | "settings";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: NavIconName;
};

export type DashboardNavSection = {
  title: string;
  items: DashboardNavItem[];
};

export const dashboardNavSections: DashboardNavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Resumen", href: "/dashboard", icon: "overview" },
      {
        label: "Ingresos y gastos",
        href: "/dashboard/movimientos",
        icon: "transactions",
      },
      { label: "Presupuestos", href: "/dashboard/presupuestos", icon: "budgets" },
      { label: "Metas", href: "/dashboard/metas", icon: "goals" },
      { label: "Préstamos", href: "/dashboard/prestamos", icon: "loans" },
    ],
  },
  {
    title: "Manejadores",
    items: [
      {
        label: "Vista general",
        href: "/dashboard/manejadores",
        icon: "managers",
      },
      {
        label: "Empresas",
        href: "/dashboard/manejadores/empresas",
        icon: "merchants",
      },
      {
        label: "Tipos de servicio",
        href: "/dashboard/manejadores/tipos-de-servicio",
        icon: "services",
      },
      {
        label: "Mis tarjetas",
        href: "/dashboard/manejadores/tarjetas",
        icon: "cards",
      },
      { label: "Bancos", href: "/dashboard/manejadores/bancos", icon: "banks" },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", href: "/dashboard/reportes", icon: "reports" },
      { label: "Configuración", href: "/dashboard/configuracion", icon: "settings" },
    ],
  },
];
