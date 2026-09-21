export type MerchantRecord = {
  id: string;
  userId: string;
  name: string;
  logoUrl: string | null;
  allowsCredit: boolean;
  createdAt: Date;
  updatedAt: Date;
};
