import dayjs, { type Dayjs } from "dayjs";
import {
  CATEGORY_COLORS,
  type Subscription,
  type SubscriptionCategory,
} from "@/domain/subscription";
import type {
  BillingCadenceMix,
  CategorySpend,
  LifecycleSummary,
  RenewalEvent,
} from "./insights.types";

const DEFAULT_CURRENCY = "USD";

export function isActiveSubscription(subscription: Subscription) {
  return (subscription.status ?? "active") === "active";
}

export function getActiveSubscriptions(subscriptions: Subscription[]) {
  return subscriptions.filter(isActiveSubscription);
}

export function getMonthlyCost(subscription: Subscription) {
  return subscription.billing === "Yearly"
    ? subscription.price / 12
    : subscription.price;
}

export function getAnnualizedCost(subscription: Subscription) {
  return subscription.billing === "Yearly"
    ? subscription.price
    : subscription.price * 12;
}

export function getMonthlyTotal(subscriptions: Subscription[]) {
  return getActiveSubscriptions(subscriptions).reduce(
    (total, subscription) => total + getMonthlyCost(subscription),
    0,
  );
}

export function getAnnualizedTotal(subscriptions: Subscription[]) {
  return getActiveSubscriptions(subscriptions).reduce(
    (total, subscription) => total + getAnnualizedCost(subscription),
    0,
  );
}

export function getSubscriptionCategory(
  subscription: Subscription,
): SubscriptionCategory {
  return subscription.category ?? "Other";
}

export function getBillingCadenceMix(
  subscriptions: Subscription[],
): BillingCadenceMix {
  const active = getActiveSubscriptions(subscriptions);
  let monthlyPlanCount = 0;
  let yearlyPlanCount = 0;
  let monthlyEquivalentFromMonthlyPlans = 0;
  let monthlyEquivalentFromYearlyPlans = 0;

  for (const subscription of active) {
    const monthly = getMonthlyCost(subscription);
    if (subscription.billing === "Yearly") {
      yearlyPlanCount += 1;
      monthlyEquivalentFromYearlyPlans += monthly;
    } else {
      monthlyPlanCount += 1;
      monthlyEquivalentFromMonthlyPlans += monthly;
    }
  }

  const runRate =
    monthlyEquivalentFromMonthlyPlans + monthlyEquivalentFromYearlyPlans;

  return {
    monthlyPlanCount,
    yearlyPlanCount,
    monthlyEquivalentFromMonthlyPlans,
    monthlyEquivalentFromYearlyPlans,
    monthlyPlansShareOfRunRate:
      runRate > 0 ? monthlyEquivalentFromMonthlyPlans / runRate : 0,
  };
}

export function getCategoryDistribution(
  subscriptions: Subscription[],
): CategorySpend[] {
  const active = getActiveSubscriptions(subscriptions);
  const monthlyTotal = getMonthlyTotal(active);
  const buckets = new Map<SubscriptionCategory, CategorySpend>();

  for (const subscription of active) {
    const category = getSubscriptionCategory(subscription);
    const current = buckets.get(category) ?? {
      category,
      color: CATEGORY_COLORS[category],
      monthlyTotal: 0,
      yearlyTotal: 0,
      percentage: 0,
      subscriptions: 0,
    };

    current.monthlyTotal += getMonthlyCost(subscription);
    current.yearlyTotal += getAnnualizedCost(subscription);
    current.subscriptions += 1;
    buckets.set(category, current);
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      percentage: monthlyTotal > 0 ? bucket.monthlyTotal / monthlyTotal : 0,
    }))
    .sort((a, b) => b.monthlyTotal - a.monthlyTotal);
}

export function parseDate(value: string | undefined, fallback: Dayjs) {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : fallback;
}

export function getBillingInterval(subscription: Subscription) {
  return subscription.billing === "Yearly"
    ? ({ amount: 1, unit: "year" } as const)
    : ({ amount: 1, unit: "month" } as const);
}

export function getNextRenewalDate(
  subscription: Subscription,
  anchorDate = new Date(),
) {
  const anchor = dayjs(anchorDate).startOf("day");
  const interval = getBillingInterval(subscription);
  let next = parseDate(
    subscription.renewalDate ?? subscription.startDate,
    anchor.add(interval.amount, interval.unit),
  );

  for (let i = 0; next.isBefore(anchor, "day") && i < 240; i += 1) {
    next = next.add(interval.amount, interval.unit);
  }

  return next;
}

export function getRenewalEventsWithin(
  subscription: Subscription,
  days: number,
  anchorDate = new Date(),
): RenewalEvent[] {
  if (!isActiveSubscription(subscription)) return [];

  const anchor = dayjs(anchorDate).startOf("day");
  const end = anchor.add(days, "day").endOf("day");
  const interval = getBillingInterval(subscription);
  const events: RenewalEvent[] = [];
  let next = getNextRenewalDate(subscription, anchor.toDate());

  for (let i = 0; next.isBefore(end) || next.isSame(end); i += 1) {
    if (i > 240) break;

    events.push({
      id: `${subscription.id}-${next.format("YYYY-MM-DD")}`,
      subscriptionId: subscription.id,
      name: subscription.name,
      icon: subscription.icon,
      iconKey: subscription.iconKey,
      category: subscription.category,
      price: subscription.price,
      currency: subscription.currency ?? DEFAULT_CURRENCY,
      billing: subscription.billing,
      date: next.toISOString(),
      daysUntil: Math.max(0, next.startOf("day").diff(anchor, "day")),
    });

    next = next.add(interval.amount, interval.unit);
  }

  return events;
}

export function getRenewalEventsWithinWindow(
  subscriptions: Subscription[],
  days: number,
  anchorDate = new Date(),
) {
  return subscriptions
    .flatMap((subscription) =>
      getRenewalEventsWithin(subscription, days, anchorDate),
    )
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
}

export function getLifecycleSummary(
  subscriptions: Subscription[],
  anchorDate = new Date(),
): LifecycleSummary {
  const anchor = dayjs(anchorDate);
  const nextThirty = getRenewalEventsWithinWindow(subscriptions, 30, anchorDate);

  return subscriptions.reduce(
    (summary, subscription) => {
      const status = subscription.status ?? "active";
      const startedAt = subscription.startDate
        ? dayjs(subscription.startDate)
        : null;

      if (status === "active") summary.active += 1;
      if (status === "paused") summary.paused += 1;
      if (status === "cancelled") summary.cancelled += 1;
      if (startedAt?.isValid() && startedAt.isSame(anchor, "month")) {
        summary.newThisMonth += 1;
      }

      return summary;
    },
    {
      active: 0,
      paused: 0,
      cancelled: 0,
      newThisMonth: 0,
      expiringSoon: nextThirty.length,
      recurringFailures: 0,
    },
  );
}
