export type BillingCycle = "Monthly" | "Yearly" | "Weekly" | "Quarterly";
export type SubscriptionStatus = "Active" | "Paused" | "Cancelled";

export interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  nextPaymentDate: string; // ISO date (YYYY-MM-DD)
  notes?: string | null;
  website?: string | null;
  monthlyCost: number;
}

export interface SubscriptionInput {
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  nextPaymentDate: string;
  notes?: string | null;
  website?: string | null;
}

export interface Summary {
  totalActive: number;
  monthlyTotal: number;
  yearlyTotal: number;
  baseCurrency: string;
  rates: Record<string, number>;
  byCategory: Record<string, number>;
  upcomingPayments: Subscription[];
}

export const BILLING_LABELS: Record<BillingCycle, string> = {
  Monthly: "Щомісяця",
  Yearly: "Щороку",
  Weekly: "Щотижня",
  Quarterly: "Щокварталу",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  Active: "Активна",
  Paused: "Призупинена",
  Cancelled: "Скасована",
};
