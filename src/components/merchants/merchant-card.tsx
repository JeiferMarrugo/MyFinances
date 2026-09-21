"use client";

import type { MerchantRecord } from "@/lib/merchants/types";
import { MerchantAvatar } from "@/components/merchants/merchant-avatar";
import { DeleteButton, EditButton } from "@/components/ui/action-buttons";

type MerchantCardProps = {
  merchant: MerchantRecord;
  onEdit: (merchant: MerchantRecord) => void;
  onDelete: (merchant: MerchantRecord) => void;
  isDeleting?: boolean;
};

export function MerchantCard({
  merchant,
  onEdit,
  onDelete,
  isDeleting = false,
}: MerchantCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <MerchantAvatar
          name={merchant.name}
          logoUrl={merchant.logoUrl}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{merchant.name}</h3>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              merchant.allowsCredit
                ? "bg-secondary text-accent"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {merchant.allowsCredit ? "Acepta crédito" : "Sin crédito"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <EditButton
          size="md"
          className="flex-1"
          onClick={() => onEdit(merchant)}
        />
        <DeleteButton
          size="md"
          className="flex-1"
          onClick={() => onDelete(merchant)}
          isLoading={isDeleting}
        />
      </div>
    </article>
  );
}
