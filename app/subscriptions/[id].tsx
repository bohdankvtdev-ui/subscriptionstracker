import "@/global.css";
import { useAuth } from "@clerk/expo";
import { Link, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { screenFill, spacing } from "@/constants/theme";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/format";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { subscriptions, updateSubscription, deleteSubscription } =
    useSubscriptionsCtx();
  const subscription = subscriptions.find((item) => item.id === id);

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const handleDelete = () => {
    if (!subscription) return;
    Alert.alert(
      "Delete subscription",
      `Remove ${subscription.name} from your account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSubscription(subscription.id);
            router.replace("/(tabs)/subscriptions");
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        screenFill,
        { paddingHorizontal: spacing[5], paddingTop: spacing[16] },
      ]}
    >
      <Text className="mb-4 text-xl font-sans-bold text-primary">
        Subscription details
      </Text>
      {subscription ? (
        <Card contentStyle={{ gap: spacing[3] }}>
          <Text className="text-2xl font-sans-extrabold text-foreground">
            {subscription.name}
          </Text>
          <Text className="text-lg font-sans-bold text-foreground">
            {formatCurrency(subscription.price, subscription.currency)} ·{" "}
            {subscription.billing}
          </Text>
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            Category: {subscription.category ?? "Other"}
          </Text>
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            Renewal: {formatSubscriptionDateTime(subscription.renewalDate)}
          </Text>
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            Status: {subscription.status ?? "active"}
          </Text>
          <Button
            tone="secondary"
            onPress={() =>
              updateSubscription(subscription.id, {
                status:
                  subscription.status === "active" ? "paused" : "active",
              })
            }
          >
            {subscription.status === "active" ? "Pause" : "Resume"}
          </Button>
          <Button tone="neutral" onPress={handleDelete}>
            Delete subscription
          </Button>
        </Card>
      ) : (
        <Text className="mb-6 font-sans-medium text-muted-foreground">
          Subscription not found: {id}
        </Text>
      )}
      <Link href="/(tabs)/subscriptions" asChild>
        <Pressable className="mt-6">
          <Text className="text-base font-sans-bold text-accent">Back to list</Text>
        </Pressable>
      </Link>
    </View>
  );
}
