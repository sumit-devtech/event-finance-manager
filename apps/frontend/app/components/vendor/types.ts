import type { VendorWithStats } from "~/types";

// Type that accepts both Date and string for Remix serialization
export type VendorWithStatsFlexible = Omit<VendorWithStats, 'createdAt' | 'updatedAt' | 'lastContract'> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  lastContract?: Date | string | null;
};


