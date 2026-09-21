import { MerchantsManager } from "@/components/merchants/merchants-manager";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function MerchantsManagerPage() {
  const session = await getRequiredPageSession();
  const merchants = await getMerchantsByUserId(session.user.id);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manejadores"
        title="Empresas"
        description="Registra los comercios donde gastas, sube su logo y define si aceptan pagos a crédito para organizar mejor tus movimientos."
      />

      <MerchantsManager initialMerchants={merchants} />
    </div>
  );
}
