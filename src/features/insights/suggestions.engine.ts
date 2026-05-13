import type { Subscription } from "@/domain/subscription";
import type { Account } from "@/src/features/account/account.types";
import {
  getAnnualizedCost,
  getCategoryDistribution,
  getMonthlyCost,
  getMonthlyTotal,
  getRenewalEventsWithinWindow,
  getSubscriptionCategory,
  isActiveSubscription,
} from "./analytics.utils";
import { getForecastSpike } from "./forecasting.service";
import type { InsightSuggestion, PriceChangeSignal } from "./insights.types";

export function getPriceChangeSignal(): PriceChangeSignal {
  return {
    status: "not_enough_history",
    message:
      "Price-change detection is ready for history, but this data set only has current prices.",
  };
}

export function buildSuggestions(
  subscriptions: Subscription[],
  account?: Account,
  anchorDate = new Date(),
): InsightSuggestion[] {
  const suggestions: InsightSuggestion[] = [];
  const active = subscriptions.filter(isActiveSubscription);
  const monthlyTotal = getMonthlyTotal(active);
  const categoryDistribution = getCategoryDistribution(active);
  const nextThirtyRenewals = getRenewalEventsWithinWindow(
    active,
    30,
    anchorDate,
  );
  const nextThirtyTotal = nextThirtyRenewals.reduce(
    (sum, event) => sum + event.price,
    0,
  );

  if (account && account.monthlyBudget <= 0) {
    suggestions.push({
      id: "set-budget",
      title: "Set a monthly budget",
      description:
        "A budget gives the app a target, so insights can flag creeping subscription spend before it becomes a surprise.",
      severity: "info",
      impactLabel: "Unlock budget warnings",
    });
  }

  if (account && account.availableBalance <= 0) {
    suggestions.push({
      id: "set-renewal-balance",
      title: "Set renewal balance",
      description:
        "Add the cash you want reserved for upcoming renewals to spot shortfalls in the next 30, 60, and 90 days.",
      severity: "info",
      impactLabel: "Unlock cash-flow coverage",
    });
  }

  if (account && account.monthlyBudget > 0 && monthlyTotal > account.monthlyBudget) {
    suggestions.push({
      id: "over-budget",
      title: "You are over monthly budget",
      description:
        "Your active monthly run rate is above the budget you set. Start with the largest plan or the most concentrated category.",
      severity: "warning",
      impactLabel: `$${(monthlyTotal - account.monthlyBudget).toFixed(0)} over budget`,
      savingsEstimate: monthlyTotal - account.monthlyBudget,
    });
  }

  if (
    account &&
    account.lowBalanceAlertEnabled &&
    account.availableBalance > 0 &&
    nextThirtyTotal > account.availableBalance
  ) {
    suggestions.push({
      id: "balance-shortfall",
      title: "Renewals exceed available balance",
      description:
        "The next 30 days of renewals are higher than the balance you set aside. Add funds or cancel non-essential renewals.",
      severity: "warning",
      impactLabel: `$${(nextThirtyTotal - account.availableBalance).toFixed(0)} shortfall`,
      subscriptionIds: nextThirtyRenewals.map((event) => event.subscriptionId),
    });
  }

  const mostExpensive = [...active].sort(
    (a, b) => getMonthlyCost(b) - getMonthlyCost(a),
  )[0];

  if (mostExpensive && getMonthlyCost(mostExpensive) >= Math.max(25, monthlyTotal * 0.22)) {
    const estimatedSavings = getMonthlyCost(mostExpensive) * 0.25 * 12;
    suggestions.push({
      id: `downgrade-${mostExpensive.id}`,
      title: `Audit ${mostExpensive.name}`,
      description:
        "This is one of your largest recurring costs. A lower plan or seat cleanup could create immediate savings.",
      severity: "saving",
      impactLabel: `Potential yearly savings: $${estimatedSavings.toFixed(0)}`,
      savingsEstimate: estimatedSavings,
      subscriptionIds: [mostExpensive.id],
    });
  }

  const concentratedCategory = categoryDistribution.find(
    (category) => category.percentage >= 0.38 && category.subscriptions > 1,
  );

  if (concentratedCategory) {
    suggestions.push({
      id: `category-${concentratedCategory.category}`,
      title: `${concentratedCategory.category} is dominating spend`,
      description:
        "Group these plans by team or workflow and check for overlapping tools before the next renewal cycle.",
      severity: "warning",
      impactLabel: `${Math.round(concentratedCategory.percentage * 100)}% of monthly spend`,
    });
  }

  const monthlyCandidates = active.filter(
    (subscription) =>
      subscription.billing === "Monthly" && getAnnualizedCost(subscription) >= 120,
  );

  if (monthlyCandidates.length > 0) {
    const estimatedSavings = monthlyCandidates.reduce(
      (sum, subscription) => sum + getAnnualizedCost(subscription) * 0.15,
      0,
    );
    suggestions.push({
      id: "annual-plan-review",
      title: "Check yearly billing discounts",
      description:
        "High-confidence monthly plans often offer annual discounts. Review the candidates before committing to another month.",
      severity: "saving",
      impactLabel: `Estimated savings: $${estimatedSavings.toFixed(0)}/yr`,
      savingsEstimate: estimatedSavings,
      subscriptionIds: monthlyCandidates.map((subscription) => subscription.id),
    });
  }

  const renewalBundleTotal = nextThirtyTotal;

  if (nextThirtyRenewals.length >= 3 || renewalBundleTotal > monthlyTotal * 0.8) {
    suggestions.push({
      id: "renewal-bundle",
      title: "Renewal bundle ahead",
      description:
        "Several renewals are clustered in the next 30 days. Decide now which ones still deserve budget.",
      severity: "warning",
      impactLabel: `$${renewalBundleTotal.toFixed(0)} due in 30 days`,
      subscriptionIds: nextThirtyRenewals.map((event) => event.subscriptionId),
    });
  }

  const paused = subscriptions.filter(
    (subscription) => subscription.status === "paused",
  );

  if (paused.length > 0) {
    suggestions.push({
      id: "paused-cleanup",
      title: "Paused subscriptions need a decision",
      description:
        "Paused plans should either be reactivated with a clear owner or cancelled before they quietly return.",
      severity: "info",
      impactLabel: `${paused.length} paused plan${paused.length === 1 ? "" : "s"}`,
      subscriptionIds: paused.map((subscription) => subscription.id),
    });
  }

  const spike = getForecastSpike(active, anchorDate);
  if (spike) {
    suggestions.push({
      id: `spike-${spike.month.key}`,
      title: `${spike.month.label} looks unusually expensive`,
      description:
        "The forecast is materially above your normal renewal months. Prepare cash flow or move cancellable plans earlier.",
      severity: "warning",
      impactLabel: `$${spike.month.total.toFixed(0)} forecast`,
      subscriptionIds: spike.month.renewals.map((event) => event.subscriptionId),
    });
  }

  if (suggestions.length === 0 && active.length > 0) {
    const category = getSubscriptionCategory(active[0]);
    suggestions.push({
      id: "steady-state",
      title: "Spend looks stable",
      description:
        "No urgent renewal clusters or oversized plans stand out. Keep building history to unlock price-spike alerts.",
      severity: "info",
      impactLabel: `${category} has the next review opportunity`,
    });
  }

  return suggestions.slice(0, 5);
}
