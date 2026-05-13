import "@/global.css";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, screenFill, spacing } from "@/constants/theme";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/format";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";
import { Card } from "@/src/components/ui/Card";
import { ChartContainer } from "@/src/components/ui/ChartContainer";
import { InsightCard } from "@/src/components/ui/InsightCard";
import { StatBlock } from "@/src/components/ui/StatBlock";
import { buildInsightsSummary } from "@/src/features/insights/insights.service";
import type {
  BillingCadenceMix,
  HeatmapCell,
  MonthSpend,
  RenewalEvent,
} from "@/src/features/insights/insights.types";

export default function InsightsTab() {
  const { account, subscriptions } = useSubscriptionsCtx();
  const insights = useMemo(
    () => buildInsightsSummary(subscriptions, account),
    [account, subscriptions],
  );
  const mostExpensiveMonth = insights.mostExpensiveMonthAhead;
  const isEmptyAccount = subscriptions.length === 0;

  return (
    <SafeAreaView style={screenFill} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[5],
          paddingBottom: spacing[30],
          gap: spacing[5],
        }}
      >
        <View style={{ gap: spacing[1] }}>
          <Text className="text-3xl font-sans-extrabold tracking-tight text-foreground">
            Insights
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Forecast renewals, detect pressure points, and find savings.
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <StatBlock
              label="Monthly"
              value={formatCurrency(insights.monthlyTotal, account.defaultCurrency)}
              detail={`${insights.activeSubscriptions.length} active subscriptions`}
              tone="sky"
            />
          </View>
          <View style={{ flex: 1 }}>
            <StatBlock
              label="True year"
              value={formatCurrency(insights.trueYearlyCost, account.defaultCurrency)}
              detail={`${formatCurrency(insights.annualizedTotal, account.defaultCurrency)} annualized run rate`}
              tone="mint"
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <StatBlock
              label="Budget"
              value={
                insights.budgetStatus.status === "not_set"
                  ? "Not set"
                  : `${Math.round(insights.budgetStatus.usage * 100)}%`
              }
              detail={
                insights.budgetStatus.status === "not_set"
                  ? "Set a monthly budget in Settings."
                  : `${formatCurrency(insights.budgetStatus.remaining, account.defaultCurrency)} remaining`
              }
              tone={insights.budgetStatus.status === "over" ? "amber" : "paper"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <StatBlock
              label="Balance"
              value={
                insights.balanceCoverage.status === "not_set"
                  ? "Not set"
                  : formatCurrency(
                      insights.balanceCoverage.remainingAfter30Days,
                      account.defaultCurrency,
                    )
              }
              detail={`${formatCurrency(insights.balanceCoverage.next30DaysDue, account.defaultCurrency)} due in 30 days`}
              tone={
                insights.balanceCoverage.status === "shortfall"
                  ? "amber"
                  : "paper"
              }
            />
          </View>
        </View>

        {isEmptyAccount ? (
          <ChartContainer
            title="Start Here"
            subtitle="Insights become more accurate as you add account setup and real subscriptions."
          >
            <View style={{ gap: spacing[3] }}>
              {insights.firstRunActions.map((action) => (
                <View
                  key={action.id}
                  className="rounded-2xl border-2 border-border bg-muted p-4"
                >
                  <Text className="text-base font-sans-extrabold text-foreground">
                    {action.title}
                  </Text>
                  <Text className="mt-1 text-sm font-sans-semibold leading-5 text-muted-foreground">
                    {action.description}
                  </Text>
                  <Text className="mt-3 text-xs font-sans-bold uppercase tracking-wider text-primary">
                    {action.actionLabel}
                  </Text>
                </View>
              ))}
            </View>
          </ChartContainer>
        ) : null}

        {!isEmptyAccount ? (
          <ChartContainer
            title="6-month cash outlook"
            subtitle="Renewal cash grouped by calendar month (rolled-forward renewals)."
          >
            <MonthlyForecastBars
              months={insights.monthlyForecast}
              currency={account.defaultCurrency}
            />
          </ChartContainer>
        ) : null}

        <ChartContainer
          title="Category Distribution"
          subtitle="Monthly equivalent spend grouped by category."
        >
          <View style={{ gap: spacing[3] }}>
            {insights.categoryDistribution.length === 0 ? (
              <EmptyText>No active category spend yet.</EmptyText>
            ) : (
              insights.categoryDistribution.map((category) => (
                <View key={category.category} style={{ gap: spacing[2] }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans-bold text-foreground">
                      {category.category}
                    </Text>
                    <Text className="font-sans-semibold text-muted-foreground">
                      {formatCurrency(category.monthlyTotal, account.defaultCurrency)} ·{" "}
                      {Math.round(category.percentage * 100)}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 16,
                      borderWidth: 2,
                      borderColor: colors.border,
                      borderRadius: 999,
                      backgroundColor: colors.muted,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.max(category.percentage * 100, 4)}%`,
                        height: "100%",
                        backgroundColor: category.color,
                      }}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </ChartContainer>

        {!isEmptyAccount ? (
          <ChartContainer
            title="Billing cadence"
            subtitle="Share of monthly run rate from monthly vs yearly plans."
          >
            <BillingCadenceBars
              mix={insights.billingCadence}
              currency={account.defaultCurrency}
            />
          </ChartContainer>
        ) : null}

        <ChartContainer
          title="Renewal Forecast"
          subtitle="Cash due in the next 30, 60, and 90 days."
        >
          <View style={{ flexDirection: "row", gap: spacing[3] }}>
            {insights.forecastWindows.map((window) => (
              <View key={window.days} style={{ flex: 1 }}>
                <Card tone="muted" offset={3} contentStyle={{ gap: spacing[1] }}>
                  <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground">
                    {window.days} days
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    className="text-2xl font-sans-extrabold text-foreground"
                  >
                    {formatCurrency(window.total, account.defaultCurrency)}
                  </Text>
                  <Text className="text-xs font-sans-semibold text-muted-foreground">
                    {window.renewalCount} renewal
                    {window.renewalCount === 1 ? "" : "s"}
                  </Text>
                </Card>
              </View>
            ))}
          </View>
        </ChartContainer>

        {!isEmptyAccount ? (
          <ChartContainer
            title="Up next"
            subtitle="Soonest renewals in the next 30 days, including rolled-forward dates."
          >
            <UpNextRenewalsList
              events={insights.nextRenewals}
              currency={account.defaultCurrency}
            />
          </ChartContainer>
        ) : null}

        <ChartContainer
          title="Spending Heatmap"
          subtitle={
            mostExpensiveMonth
              ? `${mostExpensiveMonth.label} is currently the heaviest month ahead.`
              : "No upcoming renewal pressure yet."
          }
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: spacing[3] }}>
              {insights.heatmap.map((cell) => (
                <HeatmapTile
                  key={cell.key}
                  cell={cell}
                  currency={account.defaultCurrency}
                />
              ))}
            </View>
          </ScrollView>
        </ChartContainer>

        <ChartContainer
          title="Lifecycle"
          subtitle="Current subscription state and near-term activity."
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            <LifecycleMetric label="Active" value={insights.lifecycle.active} />
            <LifecycleMetric label="Paused" value={insights.lifecycle.paused} />
            <LifecycleMetric
              label="Cancelled"
              value={insights.lifecycle.cancelled}
            />
            <LifecycleMetric
              label="New this month"
              value={insights.lifecycle.newThisMonth}
            />
            <LifecycleMetric
              label="30 day renewals"
              value={insights.lifecycle.expiringSoon}
            />
            <LifecycleMetric
              label="Failures"
              value={insights.lifecycle.recurringFailures}
            />
          </View>
        </ChartContainer>

        <View style={{ gap: spacing[3] }}>
          <Text className="text-2xl font-sans-bold tracking-tight text-foreground">
            Suggestions
          </Text>
          {insights.suggestions.map((suggestion) => (
            <InsightCard
              key={suggestion.id}
              title={suggestion.title}
              description={suggestion.description}
              impactLabel={suggestion.impactLabel}
              severity={suggestion.severity}
            />
          ))}
          <InsightCard
            title="Price history"
            description={insights.priceChangeSignal.message}
            impactLabel="History required"
            severity="info"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeatmapTile({
  cell,
  currency,
}: {
  cell: HeatmapCell;
  currency: string;
}) {
  const backgroundColor =
    cell.intensity > 0.75
      ? colors.chart4
      : cell.intensity > 0.4
        ? colors.secondary
        : colors.card;

  return (
    <View
      style={{
        width: 104,
        minHeight: 112,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 16,
        backgroundColor,
        padding: 12,
        justifyContent: "space-between",
      }}
    >
      <Text className="text-sm font-sans-bold text-foreground">
        {cell.label.replace(" ", "\n")}
      </Text>
      <View>
        <Text className="text-lg font-sans-extrabold text-foreground">
          {formatCurrency(cell.total, currency)}
        </Text>
        <Text className="text-xs font-sans-semibold text-muted-foreground">
          {cell.renewalCount} renewal{cell.renewalCount === 1 ? "" : "s"}
        </Text>
      </View>
    </View>
  );
}

function LifecycleMetric({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        width: "47%",
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 16,
        backgroundColor: colors.muted,
        padding: 12,
        gap: 4,
      }}
    >
      <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text className="text-2xl font-sans-extrabold text-foreground">
        {value}
      </Text>
    </View>
  );
}

function EmptyText({ children }: { children: string }) {
  return (
    <Text className="text-sm font-sans-semibold text-muted-foreground">
      {children}
    </Text>
  );
}

const FORECAST_BAR_MAX = 120;

function MonthlyForecastBars({
  months,
  currency,
}: {
  months: MonthSpend[];
  currency: string;
}) {
  const maxTotal = Math.max(...months.map((m) => m.total), 1);

  if (months.every((m) => m.total === 0 && m.renewalCount === 0)) {
    return <EmptyText>No renewal cash mapped in this window yet.</EmptyText>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: spacing[3], paddingVertical: spacing[1] }}>
        {months.map((month) => {
          const barHeight =
            month.total <= 0
              ? 6
              : Math.max((month.total / maxTotal) * FORECAST_BAR_MAX, 12);

          return (
            <View
              key={month.key}
              style={{
                width: 88,
                alignItems: "center",
                gap: spacing[2],
              }}
            >
              <View
                style={{
                  height: FORECAST_BAR_MAX + spacing[2],
                  width: "100%",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "72%",
                    height: barHeight,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 12,
                    backgroundColor: colors.chart2,
                  }}
                />
              </View>
              <Text className="text-center text-xs font-sans-bold text-foreground">
                {month.label}
              </Text>
              <Text className="text-center text-xs font-sans-semibold text-muted-foreground">
                {formatCurrency(month.total, currency)}
              </Text>
              <Text className="text-center text-[11px] font-sans-semibold text-muted-foreground">
                {month.renewalCount} renewal{month.renewalCount === 1 ? "" : "s"}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function BillingCadenceBars({
  mix,
  currency,
}: {
  mix: BillingCadenceMix;
  currency: string;
}) {
  const total =
    mix.monthlyEquivalentFromMonthlyPlans + mix.monthlyEquivalentFromYearlyPlans;

  if (total <= 0) {
    return <EmptyText>No active billing cadence to chart yet.</EmptyText>;
  }

  const rows = [
    {
      key: "monthly",
      label: "Monthly plans",
      detail: `${mix.monthlyPlanCount} active`,
      amount: mix.monthlyEquivalentFromMonthlyPlans,
      color: colors.chart1,
      pct: mix.monthlyPlansShareOfRunRate,
    },
    {
      key: "yearly",
      label: "Yearly plans (monthly equivalent)",
      detail: `${mix.yearlyPlanCount} active`,
      amount: mix.monthlyEquivalentFromYearlyPlans,
      color: colors.chart3,
      pct: 1 - mix.monthlyPlansShareOfRunRate,
    },
  ];

  return (
    <View style={{ gap: spacing[4] }}>
      {rows.map((row) => (
        <View key={row.key} style={{ gap: spacing[2] }}>
          <View className="flex-row items-center justify-between">
            <View style={{ flex: 1, paddingRight: spacing[2] }}>
              <Text className="font-sans-bold text-foreground">{row.label}</Text>
              <Text className="text-xs font-sans-semibold text-muted-foreground">
                {row.detail}
              </Text>
            </View>
            <Text className="font-sans-semibold text-muted-foreground">
              {formatCurrency(row.amount, currency)} · {Math.round(row.pct * 100)}%
            </Text>
          </View>
          <View
            style={{
              height: 16,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 999,
              backgroundColor: colors.muted,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.max(row.pct * 100, 4)}%`,
                height: "100%",
                backgroundColor: row.color,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function UpNextRenewalsList({
  events,
  currency,
}: {
  events: RenewalEvent[];
  currency: string;
}) {
  const upcoming = events.slice(0, 8);

  if (upcoming.length === 0) {
    return <EmptyText>No renewals scheduled in the next 30 days.</EmptyText>;
  }

  return (
    <View style={{ gap: spacing[3] }}>
      {upcoming.map((event) => (
        <View
          key={event.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[3],
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 16,
            backgroundColor: colors.muted,
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
          }}
        >
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text className="font-sans-bold text-foreground" numberOfLines={1}>
              {event.name}
            </Text>
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              {formatSubscriptionDateTime(event.date)} · {renewalTimingCopy(event.daysUntil)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing[1] }}>
            <Text className="font-sans-extrabold text-foreground">
              {formatCurrency(event.price, event.currency || currency)}
            </Text>
            <Text className="text-[11px] font-sans-bold uppercase tracking-wide text-muted-foreground">
              {event.billing}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function renewalTimingCopy(daysUntil: number) {
  if (daysUntil <= 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `In ${daysUntil} days`;
}
