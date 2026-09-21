import type { MerchantRecord } from "@/lib/merchants/types";

export function normalizeMerchantName(name: string) {
  return name.trim().toLowerCase();
}

export function findMerchantByName(
  merchants: MerchantRecord[],
  merchantName: string,
) {
  const normalized = normalizeMerchantName(merchantName);

  return merchants.find(
    (merchant) => normalizeMerchantName(merchant.name) === normalized,
  );
}
