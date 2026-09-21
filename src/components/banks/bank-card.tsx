"use client";

import type { BankRecord } from "@/lib/banks/types";
import { DeleteButton, EditButton } from "@/components/ui/action-buttons";

type BankCardProps = {
  bank: BankRecord;
  onEdit: (bank: BankRecord) => void;
  onDelete: (bank: BankRecord) => void;
  isDeleting?: boolean;
};

export function BankCard({
  bank,
  onEdit,
  onDelete,
  isDeleting = false,
}: BankCardProps) {
  const isLightBrand =
    bank.brandColor.toLowerCase() === "#fdda24" ||
    bank.brandColor.toLowerCase() === "#ffffff";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div
        className="px-5 py-6"
        style={{ backgroundColor: bank.brandColor }}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${
            isLightBrand
              ? "bg-black/10 text-foreground"
              : "bg-white/15 text-white"
          }`}
        >
          {bank.name.charAt(0)}
        </div>
        <h3
          className={`mt-4 text-xl font-bold ${
            isLightBrand ? "text-foreground" : "text-white"
          }`}
        >
          {bank.name}
        </h3>
      </div>

      <div className="flex gap-2 p-4">
        <EditButton size="md" className="flex-1" onClick={() => onEdit(bank)} />
        <DeleteButton
          size="md"
          className="flex-1"
          onClick={() => onDelete(bank)}
          isLoading={isDeleting}
        />
      </div>
    </article>
  );
}
