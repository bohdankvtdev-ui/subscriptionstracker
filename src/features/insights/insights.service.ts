import type { Subscription } from "@/domain/subscription";
import type { Account } from "@/src/features/account/account.types";
import {
  getActiveSubscriptions,
  getAnnualizedTotal,
  getBillingCadenceMix,
  getCategoryDistribution,
  getLifecycleSummary,
  getMonthlyTotal,
  getRenewalEventsWithinWindow,
} from "./analytics.utils";
import {
  buildForecastWindows,
  buildMonthlyForecast,
  buildSpendingHeatmap,
  getMostExpensiveMonthAhead,
  getTrueYearlyCost,
} from "./forecasting.service";
import {
  buildSuggestions,
  getPriceChangeSignal,
} from "./suggestions.engine";
import type { InsightsSummary } from "./insights.types";

export function buildInsightsSummary(
  subscriptions: Subscription[],
  accountOrDate?: Account | Date,
  anchorDate = new Date(),
): InsightsSummary {
  const account = accountOrDate instanceof Date ? undefined : accountOrDate;
  const date = accountOrDate instanceof Date ? accountOrDate : anchorDate;
  const activeSubscriptions = getActiveSubscriptions(subscriptions);
  const monthlyTotal = getMonthlyTotal(subscriptions);
  const forecastWindows = buildForecastWindows(subscriptions, date);
  const next30DaysDue = forecastWindows[0]?.total ?? 0;
  const budgetStatus = buildBudgetStatus(monthlyTotal, account);
  const balanceCoverage = buildBalanceCoverage(next30DaysDue, account);

  return {
    account,
    activeSubscriptions,
    monthlyTotal,
    annualizedTotal: getAnnualizedTotal(subscriptions),
    trueYearlyCost: getTrueYearlyCost(subscriptions, date),
    categoryDistribution: getCategoryDistribution(subscriptions),
    forecastWindows,
    monthlyForecast: buildMonthlyForecast(subscriptions, 6, date),
    heatmap: buildSpendingHeatmap(subscriptions, 6, date),
    mostExpensiveMonthAhead: getMostExpensiveMonthAhead(
      subscriptions,
      6,
      date,
    ),
    nextRenewals: getRenewalEventsWithinWindow(subscriptions, 30, date),
    lifecycle: getLifecycleSummary(subscriptions, date),
    suggestions: buildSuggestions(subscriptions, account, date),
    priceChangeSignal: getPriceChangeSignal(),
    budgetStatus,
    balanceCoverage,
    firstRunActions: buildFirstRunActions(subscriptions, account),
    billingCadence: getBillingCadenceMix(subscriptions),
  };
}

function buildBudgetStatus(monthlySpend: number, account?: Account) {
  const monthlyBudget = account?.monthlyBudget ?? 0;
  const remaining = monthlyBudget - monthlySpend;
  const usage = monthlyBudget > 0 ? monthlySpend / monthlyBudget : 0;

  return {
    monthlyBudget,
    monthlySpend,
    remaining,
    usage,
    status:
      monthlyBudget <= 0
        ? ("not_set" as const)
        : remaining < 0
          ? ("over" as const)
          : usage >= 0.85
            ? ("watch" as const)
            : ("healthy" as const),
  };
}

function buildBalanceCoverage(next30DaysDue: number, account?: Account) {
  const availableBalance = account?.availableBalance ?? 0;
  const remainingAfter30Days = availableBalance - next30DaysDue;

  return {
    availableBalance,
    next30DaysDue,
    remainingAfter30Days,
    status:
      availableBalance <= 0
        ? ("not_set" as const)
        : remainingAfter30Days < 0
          ? ("shortfall" as const)
          : ("covered" as const),
  };
}

function buildFirstRunActions(subscriptions: Subscription[], account?: Account) {
  if (subscriptions.length > 0) return [];

  const actions = [
    {
      id: "add-first-subscription",
      title: "Add your first subscription",
      description:
        "Start with the next renewal you remember. You can refine dates and categories later.",
      actionLabel: "Add subscription",
    },
  ];

  if (!account || account.monthlyBudget <= 0) {
    actions.unshift({
      id: "set-budget",
      title: "Set a monthly budget",
      description:
        "Tell the app what healthy subscription spend looks like for you.",
      actionLabel: "Set budget",
    });
  }

  if (!account || account.availableBalance <= 0) {
    actions.unshift({
      id: "set-balance",
      title: "Set renewal balance",
      description:
        "Reserve an amount for renewals so future forecasts can detect shortfalls.",
      actionLabel: "Set balance",
    });
  }

  return actions;
}

export * from "./analytics.utils";
export * from "./forecasting.service";
export * from "./suggestions.engine";
export * from "./insights.types";
