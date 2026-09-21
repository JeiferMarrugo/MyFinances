"use client";

import type { CardRecord } from "@/lib/cards/types";
import { cardTypeLabels } from "@/lib/cards/constants";
import { DeleteButton, EditButton } from "@/components/ui/action-buttons";

type CardItemProps = {
  card: CardRecord;
  onEdit: (card: CardRecord) => void;
  onDelete: (card: CardRecord) => void;
  isDeleting?: boolean;
};

export function CardItem({
  card,
  onEdit,
  onDelete,
  isDeleting = false,
}: CardItemProps) {
  const accent = card.brandColor ?? card.bankBrandColor ?? "#7c3aed";
  const isLightBrand = accent.toLowerCase() === "#fdda24";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div
        className="relative min-h-[160px] bg-linear-to-br p-5"
        style={{
          backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                isLightBrand ? "text-foreground/70" : "text-white/80"
              }`}
            >
              {cardTypeLabels[card.cardType]}
            </p>
            <h3
              className={`mt-2 text-lg font-bold ${
                isLightBrand ? "text-foreground" : "text-white"
              }`}
            >
              {card.name}
            </h3>
          </div>
          {!card.isActive ? (
            <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-semibold text-white">
              Inactiva
            </span>
          ) : null}
        </div>

        <div className="mt-8 flex items-end justify-between gap-3">
          <p
            className={`font-mono text-sm ${
              isLightBrand ? "text-foreground/80" : "text-white/90"
            }`}
          >
            {card.lastFourDigits ? `•••• ${card.lastFourDigits}` : "•••• ••••"}
          </p>
          <p
            className={`text-sm font-semibold ${
              isLightBrand ? "text-foreground" : "text-white"
            }`}
          >
            {card.bankName ?? "Sin banco"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-4">
        <EditButton size="md" className="flex-1" onClick={() => onEdit(card)} />
        <DeleteButton
          size="md"
          className="flex-1"
          onClick={() => onDelete(card)}
          isLoading={isDeleting}
        />
      </div>
    </article>
  );
}
