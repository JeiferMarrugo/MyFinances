import { BanksManager } from "@/components/banks/banks-manager";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";
import { getBanksByUserId } from "@/lib/banks/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function BanksManagerPage() {
  const session = await getRequiredPageSession();
  const banks = await getBanksByUserId(session.user.id);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manejadores"
        title="Bancos"
        description="Registra tus entidades financieras como Bancolombia, Davivienda o Nequi para vincularlas con tus tarjetas."
      />

      <BanksManager initialBanks={banks} />
    </div>
  );
}
