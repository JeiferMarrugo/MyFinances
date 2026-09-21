import { ManagerHubCard } from "@/components/manejadores/manager-hub-card";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";

const managers = [
  {
    href: "/dashboard/manejadores/empresas",
    title: "Empresas",
    description: "Comercios donde gastas, con logo y soporte de crédito.",
    accent: "#7c3aed",
    icon: "E",
  },
  {
    href: "/dashboard/manejadores/tipos-de-servicio",
    title: "Tipos de servicio",
    description: "Luz, gas, internet, streaming y otros pagos recurrentes.",
    accent: "#2563eb",
    icon: "S",
  },
  {
    href: "/dashboard/manejadores/tarjetas",
    title: "Mis tarjetas",
    description: "Tarjetas de crédito y débito vinculadas a tus bancos.",
    accent: "#059669",
    icon: "T",
  },
  {
    href: "/dashboard/manejadores/bancos",
    title: "Bancos",
    description: "Bancolombia, Davivienda y otras entidades financieras.",
    accent: "#FDDA24",
    icon: "B",
  },
] as const;

export default function ManagersHubPage() {
  return (
    <div className="space-y-8">
      <ManagerPageHeader
        eyebrow="Catálogos personales"
        title="Manejadores"
        description="Centraliza empresas, servicios, tarjetas y bancos para tener tus finanzas más organizadas y bonitas."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {managers.map((manager) => (
          <ManagerHubCard key={manager.href} {...manager} />
        ))}
      </div>
    </div>
  );
}
