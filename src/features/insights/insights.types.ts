import type {
  Subscription,
  SubscriptionCategory,
} from "@/domain/subscription";
import type { Account } from "@/src/features/account/account.types";

export type InsightSeverity = "info" | "warning" | "saving";

export type CategorySpend = {
  category: SubscriptionCategory;
  color: string;
  monthlyTotal: number;
  yearlyTotal: number;
  percentage: number;
  subscriptions: number;
};

export type RenewalEvent = {
  id: string;
  subscriptionId: string;
  name: string;
  icon: Subscription["icon"];
  iconKey?: string;
  category?: SubscriptionCategory;
  price: number;
  currency: string;
  billing: Subscription["billing"];
  date: string;
  daysUntil: number;
};

export type ForecastWindow = {
  days: 30 | 60 | 90;
  total: number;
  renewalCount: number;
  renewals: RenewalEvent[];
};

export type MonthSpend = {
  key: string;
  label: string;
  total: number;
  renewalCount: number;
  renewals: RenewalEvent[];
};

export type HeatmapCell = MonthSpend & {
  intensity: number;
};

export type LifecycleSummary = {
  active: number;
  paused: number;
  cancelled: number;
  newThisMonth: number;
  expiringSoon: number;
  recurringFailures: number;
};

export type InsightSuggestion = {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  impactLabel: string;
  savingsEstimate?: number;
  subscriptionIds?: string[];
};

export type PriceChangeSignal = {
  status: "not_enough_history" | "stable" | "increase_detected";
  message: string;
};

export type BudgetStatus = {
  monthlyBudget: number;
  monthlySpend: number;
  remaining: number;
  usage: number;
  status: "not_set" | "healthy" | "watch" | "over";
};

export type BalanceCoverage = {
  availableBalance: number;
  next30DaysDue: number;
  remainingAfter30Days: number;
  status: "not_set" | "covered" | "shortfall";
};

export type FirstRunAction = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
};

/** Active subs only: how much run rate comes from monthly vs yearly billing. */
export type BillingCadenceMix = {
  monthlyPlanCount: number;
  yearlyPlanCount: number;
  monthlyEquivalentFromMonthlyPlans: number;
  monthlyEquivalentFromYearlyPlans: number;
  /** Share of total monthly run rate from monthly-billed plans (0–1). */
  monthlyPlansShareOfRunRate: number;
};

export type InsightsSummary = {
  account?: Account;
  activeSubscriptions: Subscription[];
  monthlyTotal: number;
  annualizedTotal: number;
  trueYearlyCost: number;
  categoryDistribution: CategorySpend[];
  forecastWindows: ForecastWindow[];
  monthlyForecast: MonthSpend[];
  heatmap: HeatmapCell[];
  mostExpensiveMonthAhead: MonthSpend | null;
  nextRenewals: RenewalEvent[];
  lifecycle: LifecycleSummary;
  suggestions: InsightSuggestion[];
  priceChangeSignal: PriceChangeSignal;
  budgetStatus: BudgetStatus;
  balanceCoverage: BalanceCoverage;
  firstRunActions: FirstRunAction[];
  billingCadence: BillingCadenceMix;
};
