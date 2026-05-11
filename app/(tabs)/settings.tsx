import "@/global.css";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { branding } from "@/constants/branding";
import { screenFill, spacing } from "@/constants/theme";
import { apiFetch, ApiError } from "@/lib/api";

export default function Settings() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

  const performAccountDeletion = async () => {
    setDeleting(true);
    try {
      // 1. Wipe backend rows FIRST. If this fails, the Clerk account is still
      //    intact and the user can retry. Subscriptions cascade via FK.
      const token = await getToken();
      try {
        await apiFetch(token, "/v1/account", { method: "DELETE" });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // The token may have expired; if user is signed in we can ask Clerk
          // to mint a fresh one and retry once.
          const retryToken = await getToken({ skipCache: true });
          await apiFetch(retryToken, "/v1/account", { method: "DELETE" });
        } else {
          throw err;
        }
      }

      // 2. Delete the Clerk user. Clerk will sign the session out automatically.
      if (user) {
        await user.delete();
      }

      router.replace("/sign-in");
    } catch (err) {
      console.warn("[settings] account deletion failed", err);
      Alert.alert(
        "Couldn't delete account",
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    Alert.alert(
      "Delete account",
      "This permanently removes your account and all subscription data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void performAccountDeletion(),
        },
      ],
    );
  };

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return null;
  }

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const anyBusy = signingOut || deleting;

  return (
    <SafeAreaView
      style={[screenFill, { padding: spacing[5] }]}
      edges={["top", "left", "right"]}
    >
      <Text className="mb-6 text-2xl font-sans-bold tracking-tight text-foreground">
        Settings
      </Text>

      <View className="auth-card mb-6">
        <Text className="mb-1 text-sm font-sans-semibold text-muted-foreground">
          Signed in as
        </Text>
        <Text className="text-lg font-sans-bold text-foreground">
          {primaryEmail ?? user?.username ?? "Your account"}
        </Text>
        <Text className="mt-3 text-sm font-sans-medium text-muted-foreground">
          You are signed in to {branding.appName} on this device.
        </Text>
      </View>

      <Pressable
        className={anyBusy ? "auth-button auth-button-disabled" : "auth-button"}
        disabled={anyBusy}
        onPress={handleSignOut}
      >
        <Text className="auth-button-text">
          {signingOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>

      <View className="mt-10 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-5">
        <Text className="mb-1 text-sm font-sans-bold uppercase tracking-wider text-destructive">
          Danger zone
        </Text>
        <Text className="mb-4 text-sm font-sans-medium text-muted-foreground">
          Permanently delete your account and all subscription data from {branding.appName}. This cannot be undone.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          disabled={anyBusy}
          onPress={handleDeleteAccount}
          className={
            anyBusy
              ? "items-center rounded-2xl border-2 border-destructive/40 bg-destructive/60 py-4"
              : "items-center rounded-2xl border-2 border-destructive bg-destructive py-4"
          }
        >
          <Text className="text-base font-sans-bold text-destructive-foreground">
            {deleting ? "Deleting account..." : "Delete account"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
