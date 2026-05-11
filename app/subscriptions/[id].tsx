import "@/global.css";
import { useAuth } from "@clerk/expo";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { screenFill, spacing } from "@/constants/theme";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

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
      <Text className="mb-6 font-sans-medium text-muted-foreground">ID: {id}</Text>
      <Link href="/(tabs)/subscriptions" asChild>
        <Pressable>
          <Text className="text-base font-sans-bold text-accent">Back to list</Text>
        </Pressable>
      </Link>
    </View>
  );
}
