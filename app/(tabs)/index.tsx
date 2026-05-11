import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/domain/seed";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/format";
import dayjs from "dayjs";
import ListHeading from "@/components/ui/ListHeading";
import UpcomingSubscriptionCard from "@/components/subscriptions/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import { screenFill, spacing } from "@/constants/theme";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";
import { useState } from "react";

export default function App() {
  const { subscriptions, openCreate } = useSubscriptionsCtx();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

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
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New subscription"
                onPress={openCreate}
                hitSlop={spacing[2]}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet</Text>
        }
      />
    </SafeAreaView>
  );
}
