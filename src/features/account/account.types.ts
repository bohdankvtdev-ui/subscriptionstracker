export type InsightFocus = "balanced" | "savings" | "forecasting";

export type AccountCompletionState = {
  hasDisplayName: boolean;
  hasBudget: boolean;
  hasBalance: boolean;
  missing: ("displayName" | "monthlyBudget" | "availableBalance")[];
};

export type Account = {
  id: string;
  email: string | null;
  displayName: string | null;
  defaultCurrency: string;
  monthlyBudget: number;
  availableBalance: number;
  lowBalanceAlertEnabled: boolean;
  renewalReminderDays: number;
  insightFocus: InsightFocus;
  completion: AccountCompletionState;
  createdAt: number;
  updatedAt: number;
};

export type AccountPatch = Partial<{
  displayName: string | null;
  defaultCurrency: string;
  monthlyBudget: number;
  availableBalance: number;
  lowBalanceAlertEnabled: boolean;
  renewalReminderDays: number;
  insightFocus: InsightFocus;
}>;
