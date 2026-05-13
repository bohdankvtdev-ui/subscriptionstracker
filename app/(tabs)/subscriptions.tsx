import "@/global.css";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";
import {
  enterDown,
  enterDownDelayed,
  enterListItem,
  layoutList,
} from "@/constants/motion";
import { colors, neo, screenFill, spacing } from "@/constants/theme";
import type { Subscription } from "@/domain/subscription";
import { formatCurrency } from "@/lib/format";
import { getMonthlyTotal } from "@/src/features/insights/analytics.utils";

const AnimatedView = Animated.View;

function matchesQuery(sub: Subscription, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    sub.name.toLowerCase().includes(q) ||
    (sub.category?.toLowerCase().includes(q) ?? false) ||
    (sub.plan?.toLowerCase().includes(q) ?? false) ||
    (sub.billing?.toLowerCase().includes(q) ?? false) ||
    (sub.status?.toLowerCase().includes(q) ?? false)
  );
}

export default function SubscriptionsTab() {
  const { subscriptions, updateSubscription, deleteSubscription } =
    useSubscriptionsCtx();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => subscriptions.filter((s) => matchesQuery(s, query.trim())),
    [subscriptions, query],
  );

  const monthlyTotal = useMemo(() => getMonthlyTotal(filtered), [filtered]);

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
            <AnimatedView entering={enterDown}>
              <Text className="text-3xl font-sans-extrabold tracking-tight text-foreground">
                Subscriptions
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {subscriptions.length} total · {formatCurrency(monthlyTotal)}/mo
                {query ? ` · ${filtered.length} match${filtered.length === 1 ? "" : "es"}` : ""}
              </Text>
            </AnimatedView>

            <AnimatedView
              entering={enterDownDelayed(40)}
              style={{ marginTop: spacing[5] }}
            >
              <View style={styles.searchWrap}>
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.foreground}
                  style={{ opacity: 0.6 }}
                />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search name, category, billing…"
                  placeholderTextColor="#9b9690"
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.searchInput}
                  className="font-sans-medium"
                />
                {query.length > 0 ? (
                  <Pressable
                    onPress={() => setQuery("")}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.foreground}
                      style={{ opacity: 0.65 }}
                    />
                  </Pressable>
                ) : null}
              </View>
            </AnimatedView>

            <View style={{ height: spacing[5] }} />
          </>
        )}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedView entering={enterListItem(index, 56, 14)} layout={layoutList}>
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId((cur) => (cur === item.id ? null : item.id))
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
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <AnimatedView entering={FadeIn.duration(220)}>
            <View style={styles.emptyCard}>
              <Text className="text-base font-sans-bold text-foreground">
                {subscriptions.length === 0
                  ? "No subscriptions yet"
                  : `No results for “${query}”`}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {subscriptions.length === 0
                  ? "Tap the + in the tab bar to add your first one."
                  : "Try a different name, category, or plan."}
              </Text>
            </View>
          </AnimatedView>
        }
      />
    </SafeAreaView>
  );
}

const styles = {
  searchWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    borderWidth: neo.border,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: colors.foreground,
    padding: 0,
  },
  emptyCard: {
    borderWidth: neo.border,
    borderColor: colors.border,
    borderStyle: "dashed" as const,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    alignItems: "flex-start" as const,
  },
};
