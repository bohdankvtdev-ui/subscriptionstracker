import "@/global.css";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatCurrency } from "@/lib/format";
import dayjs from "dayjs";
import ListHeading from "@/components/ui/ListHeading";
import UpcomingSubscriptionCard from "@/components/subscriptions/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import {
  enterDown,
  enterDownDelayed,
  enterListItem,
  enterUpDelayed,
  layoutList,
} from "@/constants/motion";
import { colors, neo, screenFill, spacing } from "@/constants/theme";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";
import { useMemo, useState } from "react";
import { Press3D } from "@/components/ui/Press3D";
import { buildInsightsSummary } from "@/src/features/insights/insights.service";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { useRouter } from "expo-router";
import { SubscriptionIcon } from "@/components/subscriptions/SubscriptionIcon";

const AnimatedView = Animated.View;

export default function App() {
  const router = useRouter();
  const {
    account,
    subscriptions,
    openCreate,
    updateSubscription,
    deleteSubscription,
    isLoading,
    isAccountLoading,
    error,
    accountError,
  } = useSubscriptionsCtx();
  const insights = useMemo(
    () => buildInsightsSummary(subscriptions, account),
    [account, subscriptions],
  );
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const nextRenewal = insights.nextRenewals[0];
  const nextRenewalDate = nextRenewal?.date;
  const isEmptyAccount = subscriptions.length === 0;
  const isLoadingData = isLoading || isAccountLoading;
  const displayName = account.displayName?.trim() || "Your account";
  const confirmDeleteSubscription = (id: string, name: string) => {
    Alert.alert("Delete subscription", `Remove ${name} from your account?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteSubscription(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={screenFill} edges={["top", "left", "right"]}>
      <FlatList
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[5],
          paddingBottom: spacing[30],
        }}
        ListHeaderComponent={() => (
          <>
            <AnimatedView entering={enterDown} className="home-header">
              <View className="home-user">
                <View
                  style={{
                    borderWidth: neo.border,
                    borderColor: colors.border,
                    borderRadius: 18,
                    backgroundColor: colors.accent,
                    width: 64,
                    height: 64,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SubscriptionIcon iconKey="user" size={42} />
                </View>
                <View style={{ marginLeft: spacing[4], flex: 1 }}>
                  <Text className="home-user-name" style={{ marginLeft: 0 }}>
                    {displayName}
                  </Text>
                  <Text className="text-sm font-sans-semibold text-muted-foreground">
                    {isEmptyAccount
                      ? "Add subscriptions to see renewals, budgets, and savings tips"
                      : `${subscriptions.length} tracked · use Insights for charts & tips`}
                  </Text>
                </View>
              </View>
            </AnimatedView>

            {error || accountError ? (
              <Card tone="amber" contentStyle={{ marginBottom: spacing[4] }}>
                <Text className="text-base font-sans-bold text-foreground">
                  Some data could not load
                </Text>
                <Text className="mt-1 text-sm font-sans-semibold text-foreground">
                  {accountError ?? error}
                </Text>
              </Card>
            ) : null}

            <AnimatedView entering={enterDownDelayed(48)}>
              <Press3D
                offset={neo.offsetLg}
                radius={20}
                shadowColor={neo.shadowColor}
                accessibilityLabel="Spending overview"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: neo.border,
                  borderColor: colors.border,
                  padding: 22,
                  gap: spacing[4],
                }}
              >
                <View className="home-balance-row" style={{ alignItems: "flex-start" }}>
                  <View style={{ flex: 1, gap: spacing[1] }}>
                    <Text className="home-balance-label">
                      {isEmptyAccount ? "Get started" : "Monthly run rate"}
                    </Text>
                    <Text className="home-balance-amount" style={{ fontSize: 36 }}>
                      {isLoadingData
                        ? "…"
                        : formatCurrency(insights.monthlyTotal, account.defaultCurrency)}
                    </Text>
                    <Text className="text-xs font-sans-semibold leading-4 text-muted-foreground">
                      Active plans only · normalized to a monthly figure
                    </Text>
                  </View>
                  <View
                    style={{
                      maxWidth: "46%",
                      alignItems: "flex-end",
                      gap: spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 10,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: colors.mutedForeground,
                      }}
                    >
                      Next renewal
                    </Text>
                    {nextRenewalDate && nextRenewal ? (
                      <>
                        <View
                          style={{
                            borderWidth: neo.borderLight,
                            borderColor: colors.border,
                            backgroundColor: colors.secondary,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <Text className="home-balance-date" style={{ fontSize: 14 }}>
                            {dayjs(nextRenewalDate).format("MMM D")}
                          </Text>
                        </View>
                        <Text
                          className="text-xs font-sans-semibold text-foreground"
                          numberOfLines={2}
                          style={{ textAlign: "right" }}
                        >
                          {nextRenewal.name}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-xs font-sans-semibold text-muted-foreground">
                        {isLoadingData ? "…" : "Nothing in the next 30 days"}
                      </Text>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    opacity: 0.35,
                  }}
                />
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  {formatCurrency(insights.trueYearlyCost, account.defaultCurrency)} in renewal
                  cash over the next 365 days
                </Text>
                {!isEmptyAccount ? (
                  <View style={{ flexDirection: "row", gap: spacing[3] }}>
                    <HomeQuickLink
                      icon="pie-chart-outline"
                      label="Insights"
                      hint="Forecasts & tips"
                      onPress={() => router.push("/(tabs)/insights")}
                    />
                    <HomeQuickLink
                      icon="list-outline"
                      label="All plans"
                      hint="Search & edit"
                      onPress={() => router.push("/(tabs)/subscriptions")}
                    />
                  </View>
                ) : null}
              </Press3D>
            </AnimatedView>

            {isEmptyAccount ? (
              <AnimatedView
                entering={enterUpDelayed(72)}
                style={{ gap: spacing[4], marginTop: spacing[5], marginBottom: spacing[5] }}
              >
                <SetupCard
                  title="Set your monthly budget"
                  description="Give insights a target so it can warn you before subscriptions creep past your limit."
                  value={formatCurrency(
                    account.monthlyBudget,
                    account.defaultCurrency,
                  )}
                  action="Edit budget"
                  onPress={() => router.push("/(tabs)/settings")}
                />
                <SetupCard
                  title="Set renewal balance"
                  description="Track cash available for upcoming renewals and spot shortfalls before they happen."
                  value={formatCurrency(
                    account.availableBalance,
                    account.defaultCurrency,
                  )}
                  action="Edit balance"
                  onPress={() => router.push("/(tabs)/settings")}
                />
                <SetupCard
                  title="Add your first subscription"
                  description="One subscription is enough to unlock renewal forecasts, category spend, and savings ideas."
                  value="Start here"
                  action="Add subscription"
                  onPress={openCreate}
                />
              </AnimatedView>
            ) : null}

            {!isEmptyAccount ? (
              <AnimatedView entering={enterUpDelayed(88)} className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={insights.nextRenewals.slice(0, 6)}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard
                    icon={item.icon}
                    iconKey={item.iconKey}
                    name={item.name}
                    price={item.price}
                    currency={item.currency}
                    daysLeft={item.daysUntil}
                    onPress={() =>
                      router.push(`/subscriptions/${item.subscriptionId}`)
                    }
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 6 }}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet
                  </Text>
                }
              />
              </AnimatedView>
            ) : null}

            {!isEmptyAccount ? (
              <AnimatedView entering={enterUpDelayed(104)}>
              <ListHeading title="All Subscriptions" />
              </AnimatedView>
            ) : (
              <AnimatedView entering={enterUpDelayed(120)}>
                <Card tone="sky" contentStyle={{ gap: spacing[3] }}>
                  <Text className="text-xl font-sans-extrabold text-foreground">
                    What unlocks next
                  </Text>
                  <Text className="text-sm font-sans-semibold leading-5 text-foreground">
                    Renewal forecasts, category distribution, budget warnings,
                    balance coverage, and downgrade suggestions appear as soon
                    as you add real subscriptions.
                  </Text>
                </Card>
              </AnimatedView>
            )}
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedView entering={enterListItem(index, 100, 20)} layout={layoutList}>
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
              onCancelPress={() =>
                updateSubscription(item.id, {
                  status: item.status === "active" ? "paused" : "active",
                })
              }
              onDeletePress={() =>
                confirmDeleteSubscription(item.id, item.name)
              }
            />
          </AnimatedView>
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">
            Use the setup cards above to begin.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

function HomeQuickLink({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${hint}`}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        borderWidth: neo.borderLight,
        borderColor: colors.border,
        borderRadius: 14,
        backgroundColor: pressed ? colors.muted : colors.input,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[3],
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={colors.foreground} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text className="text-sm font-sans-extrabold text-foreground">{label}</Text>
        <Text
          className="text-xs font-sans-semibold text-muted-foreground"
          numberOfLines={1}
        >
          {hint}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SetupCard({
  title,
  description,
  value,
  action,
  onPress,
}: {
  title: string;
  description: string;
  value: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <Card contentStyle={{ gap: spacing[3] }}>
      <View className="flex-row items-start justify-between gap-4">
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text className="text-lg font-sans-extrabold text-foreground">
            {title}
          </Text>
          <Text className="text-sm font-sans-semibold leading-5 text-muted-foreground">
            {description}
          </Text>
        </View>
        <View className="rounded-xl border-2 border-border bg-muted px-3 py-2">
          <Text className="text-sm font-sans-bold text-foreground">{value}</Text>
        </View>
      </View>
      <Button tone="secondary" onPress={onPress}>
        {action}
      </Button>
    </Card>
  );
}
