import type { CardType } from "@/lib/cards/constants";

export type CardRecord = {
  id: string;
  userId: string;
  bankId: string | null;
  name: string;
  cardType: CardType;
  lastFourDigits: string | null;
  brandColor: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  bankName?: string | null;
  bankBrandColor?: string | null;
};
