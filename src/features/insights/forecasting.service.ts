import dayjs from "dayjs";
import type { Subscription } from "@/domain/subscription";
import {
  getRenewalEventsWithinWindow,
  getActiveSubscriptions,
} from "./analytics.utils";
import type { ForecastWindow, HeatmapCell, MonthSpend } from "./insights.types";

const FORECAST_WINDOWS: ForecastWindow["days"][] = [30, 60, 90];

export function buildForecastWindows(
  subscriptions: Subscription[],
  anchorDate = new Date(),
): ForecastWindow[] {
  return FORECAST_WINDOWS.map((days) => {
    const renewals = getRenewalEventsWithinWindow(
      subscriptions,
      days,
      anchorDate,
    );

    return {
      days,
      total: renewals.reduce((sum, event) => sum + event.price, 0),
      renewalCount: renewals.length,
      renewals,
    };
  });
}

export function buildMonthlyForecast(
  subscriptions: Subscription[],
  monthsAhead = 6,
  anchorDate = new Date(),
): MonthSpend[] {
  const anchor = dayjs(anchorDate).startOf("month");
  const end = anchor.add(monthsAhead, "month").subtract(1, "day");
  const daysAhead = Math.max(1, end.diff(dayjs(anchorDate).startOf("day"), "day"));
  const renewals = getRenewalEventsWithinWindow(
    subscriptions,
    daysAhead,
    anchorDate,
  );

  return Array.from({ length: monthsAhead }, (_, index) => {
    const month = anchor.add(index, "month");
    const monthRenewals = renewals.filter((event) =>
      dayjs(event.date).isSame(month, "month"),
    );

    return {
      key: month.format("YYYY-MM"),
      label: month.format("MMM YYYY"),
      total: monthRenewals.reduce((sum, event) => sum + event.price, 0),
      renewalCount: monthRenewals.length,
      renewals: monthRenewals,
    };
  });
}

export function buildSpendingHeatmap(
  subscriptions: Subscription[],
  monthsAhead = 6,
  anchorDate = new Date(),
): HeatmapCell[] {
  const monthlyForecast = buildMonthlyForecast(
    subscriptions,
    monthsAhead,
    anchorDate,
  );
  const maxTotal = Math.max(...monthlyForecast.map((month) => month.total), 0);

  return monthlyForecast.map((month) => ({
    ...month,
    intensity: maxTotal > 0 ? month.total / maxTotal : 0,
  }));
}

export function getMostExpensiveMonthAhead(
  subscriptions: Subscription[],
  monthsAhead = 6,
  anchorDate = new Date(),
): MonthSpend | null {
  const forecast = buildMonthlyForecast(subscriptions, monthsAhead, anchorDate);
  if (forecast.length === 0) return null;

  return forecast.reduce((highest, month) =>
    month.total > highest.total ? month : highest,
  );
}

export function getTrueYearlyCost(
  subscriptions: Subscription[],
  anchorDate = new Date(),
) {
  return getRenewalEventsWithinWindow(subscriptions, 365, anchorDate).reduce(
    (sum, event) => sum + event.price,
    0,
  );
}

export function getForecastSpike(
  subscriptions: Subscription[],
  anchorDate = new Date(),
) {
  const activeCount = getActiveSubscriptions(subscriptions).length;
  const forecast = buildMonthlyForecast(subscriptions, 6, anchorDate);
  const monthsWithSpend = forecast.filter((month) => month.total > 0);
  if (activeCount === 0 || monthsWithSpend.length < 2) return null;

  const average =
    monthsWithSpend.reduce((sum, month) => sum + month.total, 0) /
    monthsWithSpend.length;
  const spike = forecast.find(
    (month) => average > 0 && month.total >= average * 1.5,
  );

  return spike ? { month: spike, average } : null;
}
