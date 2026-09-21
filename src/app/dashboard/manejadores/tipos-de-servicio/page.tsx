import { ServiceTypesManager } from "@/components/service-types/service-types-manager";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";
import { getServiceTypesByUserId } from "@/lib/service-types/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function ServiceTypesManagerPage() {
  const session = await getRequiredPageSession();
  const serviceTypes = await getServiceTypesByUserId(session.user.id);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manejadores"
        title="Tipos de servicio"
        description="Define luz, gas, internet, streaming y otros servicios fijos para clasificar mejor tus gastos mensuales."
      />

      <ServiceTypesManager initialServiceTypes={serviceTypes} />
    </div>
  );
}
