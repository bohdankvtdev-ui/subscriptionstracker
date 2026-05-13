import { describe, expect, it } from "vitest";
import type { Subscription } from "@/domain/subscription";
import {
  buildInsightsSummary,
  buildMonthlyForecast,
  getBillingCadenceMix,
  getCategoryDistribution,
  getMonthlyTotal,
  getRenewalEventsWithinWindow,
  getTrueYearlyCost,
} from "../insights.service";
import type { Account } from "@/src/features/account/account.types";

const icon = { uri: "test-icon" };
const anchor = new Date("2026-05-12T12:00:00.000Z");
const account: Account = {
  id: "user_1",
  email: "test@example.com",
  displayName: "Test User",
  defaultCurrency: "USD",
  monthlyBudget: 90,
  availableBalance: 100,
  lowBalanceAlertEnabled: true,
  renewalReminderDays: 7,
  insightFocus: "balanced",
  completion: {
    hasDisplayName: true,
    hasBudget: true,
    hasBalance: true,
    missing: [],
  },
  createdAt: 0,
  updatedAt: 0,
};

function subscription(overrides: Partial<Subscription>): Subscription {
  return {
    id: "sub",
    icon,
    name: "Subscription",
    price: 10,
    currency: "USD",
    billing: "Monthly",
    status: "active",
    category: "Other",
    renewalDate: "2026-05-20T09:00:00.000Z",
    startDate: "2026-01-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("insights engine", () => {
  it("splits billing cadence between monthly and yearly plans", () => {
    const subscriptions = [
      subscription({ id: "m1", price: 30, billing: "Monthly" }),
      subscription({ id: "m2", price: 30, billing: "Monthly" }),
      subscription({
        id: "y1",
        price: 120,
        billing: "Yearly",
        renewalDate: "2026-06-01T09:00:00.000Z",
      }),
    ];

    const mix = getBillingCadenceMix(subscriptions);

    expect(mix).toMatchObject({
      monthlyPlanCount: 2,
      yearlyPlanCount: 1,
      monthlyEquivalentFromMonthlyPlans: 60,
      monthlyEquivalentFromYearlyPlans: 10,
    });
    expect(mix.monthlyPlansShareOfRunRate).toBeCloseTo(60 / 70, 5);
  });

  it("normalizes monthly totals and excludes inactive subscriptions", () => {
    const subscriptions = [
      subscription({ id: "monthly", price: 30, billing: "Monthly" }),
      subscription({ id: "yearly", price: 120, billing: "Yearly" }),
      subscription({ id: "paused", price: 99, status: "paused" }),
      subscription({ id: "cancelled", price: 99, status: "cancelled" }),
    ];

    expect(getMonthlyTotal(subscriptions)).toBe(40);
  });

  it("rolls old renewal dates forward into forecast windows", () => {
    const subscriptions = [
      subscription({
        id: "monthly",
        name: "Monthly Tool",
        price: 30,
        renewalDate: "2026-02-20T09:00:00.000Z",
      }),
      subscription({
        id: "yearly",
        name: "Yearly Tool",
        price: 120,
        billing: "Yearly",
        renewalDate: "2026-06-01T09:00:00.000Z",
      }),
    ];

    const renewals = getRenewalEventsWithinWindow(subscriptions, 30, anchor);

    expect(renewals.map((event) => event.name)).toEqual([
      "Monthly Tool",
      "Yearly Tool",
    ]);
    expect(renewals.reduce((sum, event) => sum + event.price, 0)).toBe(150);
  });

  it("calculates true yearly cash flow from actual renewals", () => {
    const subscriptions = [
      subscription({ id: "monthly", price: 30 }),
      subscription({
        id: "yearly",
        price: 120,
        billing: "Yearly",
        renewalDate: "2026-06-01T09:00:00.000Z",
      }),
    ];

    expect(getTrueYearlyCost(subscriptions, anchor)).toBe(480);
  });

  it("groups active monthly spend by category", () => {
    const subscriptions = [
      subscription({ id: "design", price: 30, category: "Design" }),
      subscription({ id: "design-yearly", price: 120, billing: "Yearly", category: "Design" }),
      subscription({ id: "cloud", price: 20, category: "Cloud" }),
    ];

    const distribution = getCategoryDistribution(subscriptions);

    expect(distribution[0]).toMatchObject({
      category: "Design",
      monthlyTotal: 40,
      subscriptions: 2,
    });
    expect(distribution[1]).toMatchObject({
      category: "Cloud",
      monthlyTotal: 20,
      subscriptions: 1,
    });
  });

  it("builds a month-by-month renewal forecast", () => {
    const subscriptions = [
      subscription({ id: "monthly", price: 30 }),
      subscription({
        id: "yearly",
        price: 120,
        billing: "Yearly",
        renewalDate: "2026-06-01T09:00:00.000Z",
      }),
    ];

    const forecast = buildMonthlyForecast(subscriptions, 2, anchor);

    expect(forecast).toEqual([
      expect.objectContaining({ key: "2026-05", total: 30, renewalCount: 1 }),
      expect.objectContaining({ key: "2026-06", total: 150, renewalCount: 2 }),
    ]);
  });

  it("produces actionable suggestions from spend pressure", () => {
    const subscriptions = [
      subscription({
        id: "expensive",
        name: "Expensive Suite",
        price: 80,
        category: "Design",
      }),
      subscription({
        id: "design-helper",
        name: "Design Helper",
        price: 20,
        category: "Design",
      }),
      subscription({
        id: "paused",
        name: "Paused Tool",
        price: 20,
        status: "paused",
      }),
    ];

    const summary = buildInsightsSummary(subscriptions, anchor);

    expect(summary.suggestions.map((suggestion) => suggestion.id)).toEqual(
      expect.arrayContaining([
        "downgrade-expensive",
        "category-Design",
        "annual-plan-review",
        "paused-cleanup",
      ]),
    );
    expect(summary.priceChangeSignal.status).toBe("not_enough_history");
  });

  it("adds account-aware budget and balance coverage", () => {
    const subscriptions = [
      subscription({
        id: "expensive",
        name: "Expensive Suite",
        price: 120,
        renewalDate: "2026-05-20T09:00:00.000Z",
      }),
    ];

    const summary = buildInsightsSummary(subscriptions, account, anchor);

    expect(summary.budgetStatus).toMatchObject({
      monthlyBudget: 90,
      monthlySpend: 120,
      status: "over",
      remaining: -30,
    });
    expect(summary.balanceCoverage).toMatchObject({
      availableBalance: 100,
      next30DaysDue: 120,
      status: "shortfall",
      remainingAfter30Days: -20,
    });
    expect(summary.suggestions.map((suggestion) => suggestion.id)).toEqual(
      expect.arrayContaining(["over-budget", "balance-shortfall"]),
    );
  });

  it("returns first-run actions for an empty account", () => {
    const summary = buildInsightsSummary([], {
      ...account,
      monthlyBudget: 0,
      availableBalance: 0,
    }, anchor);

    expect(summary.firstRunActions.map((action) => action.id)).toEqual([
      "set-balance",
      "set-budget",
      "add-first-subscription",
    ]);
    expect(summary.suggestions.map((suggestion) => suggestion.id)).toEqual(
      expect.arrayContaining(["set-budget", "set-renewal-balance"]),
    );
  });
});
