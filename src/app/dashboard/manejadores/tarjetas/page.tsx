import { CardsManager } from "@/components/cards/cards-manager";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";
import { getBanksByUserId } from "@/lib/banks/queries";
import { getCardsByUserId } from "@/lib/cards/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function CardsManagerPage() {
  const session = await getRequiredPageSession();
  const userId = session.user.id;
  const [cards, banks] = await Promise.all([
    getCardsByUserId(userId),
    getBanksByUserId(userId),
  ]);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manejadores"
        title="Mis tarjetas"
        description="Administra tus tarjetas de crédito y débito, vinculadas a tus bancos, para identificarlas fácilmente."
      />

      <CardsManager initialCards={cards} banks={banks} />
    </div>
  );
}
