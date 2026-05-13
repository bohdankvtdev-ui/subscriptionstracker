import "@/global.css";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { branding } from "@/constants/branding";
import { colors, screenFill, spacing } from "@/constants/theme";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { useSubscriptionsCtx } from "@/state/SubscriptionsContext";
import type { InsightFocus } from "@/src/features/account/account.types";

const INSIGHT_FOCUS_OPTIONS: { value: InsightFocus; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "savings", label: "Savings" },
  { value: "forecasting", label: "Forecasting" },
];

export default function Settings() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const {
    account,
    accountError,
    updateAccount,
    isAccountLoading,
    isAccountSaving,
  } = useSubscriptionsCtx();
  const [signingOut, setSigningOut] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [displayName, setDisplayName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [renewalReminderDays, setRenewalReminderDays] = useState("7");
  const [lowBalanceAlertEnabled, setLowBalanceAlertEnabled] = useState(true);
  const [insightFocus, setInsightFocus] = useState<InsightFocus>("balanced");

  useEffect(() => {
    setDisplayName(account.displayName ?? "");
    setDefaultCurrency(account.defaultCurrency);
    setMonthlyBudget(String(account.monthlyBudget));
    setAvailableBalance(
      String(account.availableBalance),
    );
    setRenewalReminderDays(String(account.renewalReminderDays));
    setLowBalanceAlertEnabled(account.lowBalanceAlertEnabled);
    setInsightFocus(account.insightFocus);
  }, [account]);

  const parsedMonthlyBudget = useMemo(
    () => parseAmount(monthlyBudget),
    [monthlyBudget],
  );
  const parsedAvailableBalance = useMemo(
    () => parseAmount(availableBalance),
    [availableBalance],
  );
  const parsedReminderDays = useMemo(
    () => parseInt(renewalReminderDays, 10),
    [renewalReminderDays],
  );

  const saveDisabled =
    isAccountSaving ||
    parsedMonthlyBudget === null ||
    parsedAvailableBalance === null ||
    !Number.isInteger(parsedReminderDays) ||
    parsedReminderDays < 1 ||
    parsedReminderDays > 90 ||
    !/^[A-Za-z]{3}$/.test(defaultCurrency.trim());

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

  const handleSaveAccount = async () => {
    if (saveDisabled) return;

    try {
      await updateAccount({
        displayName: displayName.trim() || null,
        defaultCurrency: defaultCurrency.trim().toUpperCase(),
        monthlyBudget: parsedMonthlyBudget ?? 0,
        availableBalance: parsedAvailableBalance ?? 0,
        lowBalanceAlertEnabled,
        renewalReminderDays: parsedReminderDays,
        insightFocus,
      });
      Alert.alert("Account saved", "Your budget and insight settings are up to date.");
    } catch (err) {
      Alert.alert(
        "Couldn't save account",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return null;
  }

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const anyBusy = signingOut || deleting || isAccountSaving;

  return (
    <SafeAreaView
      style={screenFill}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing[5],
          paddingBottom: spacing[30],
          gap: spacing[5],
        }}
      >
        <Text className="text-3xl font-sans-extrabold tracking-tight text-foreground">
          Settings
        </Text>

        <Card>
          <Text className="mb-1 text-sm font-sans-semibold text-muted-foreground">
            Signed in as
          </Text>
          <Text className="text-lg font-sans-bold text-foreground">
            {primaryEmail ?? user?.username ?? "Your account"}
          </Text>
          <Text className="mt-3 text-sm font-sans-medium text-muted-foreground">
            Account settings sync through the backend for {branding.appName}.
          </Text>
        </Card>

        <Card contentStyle={{ gap: spacing[4] }}>
          <View>
            <Text className="text-xl font-sans-extrabold text-foreground">
              Account setup
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              These numbers make forecasts, budget warnings, and empty-account
              guidance useful.
            </Text>
          </View>

          {accountError ? (
            <Text className="text-sm font-sans-bold text-destructive">
              {accountError}
            </Text>
          ) : null}

          <Input
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            editable={!isAccountLoading}
          />
          <Input
            label="Default currency"
            value={defaultCurrency}
            onChangeText={setDefaultCurrency}
            placeholder="USD"
            autoCapitalize="characters"
            maxLength={3}
            error={
              /^[A-Za-z]{3}$/.test(defaultCurrency.trim())
                ? null
                : "Use a 3-letter currency code."
            }
          />
          <Input
            label="Monthly subscription budget"
            value={monthlyBudget}
            onChangeText={setMonthlyBudget}
            placeholder="250"
            keyboardType="decimal-pad"
            error={
              parsedMonthlyBudget === null
                ? "Enter zero or a positive number."
                : null
            }
          />
          <Input
            label="Available renewal balance"
            value={availableBalance}
            onChangeText={setAvailableBalance}
            placeholder="500"
            keyboardType="decimal-pad"
            error={
              parsedAvailableBalance === null
                ? "Enter zero or a positive number."
                : null
            }
          />
          <Input
            label="Renewal reminder days"
            value={renewalReminderDays}
            onChangeText={setRenewalReminderDays}
            placeholder="7"
            keyboardType="number-pad"
            error={
              Number.isInteger(parsedReminderDays) &&
              parsedReminderDays >= 1 &&
              parsedReminderDays <= 90
                ? null
                : "Use a number from 1 to 90."
            }
          />

          <View className="flex-row items-center justify-between rounded-2xl border-2 border-border bg-muted p-4">
            <View style={{ flex: 1 }}>
              <Text className="text-base font-sans-bold text-foreground">
                Low balance alerts
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Warn when renewals exceed available balance.
              </Text>
            </View>
            <Switch
              value={lowBalanceAlertEnabled}
              onValueChange={setLowBalanceAlertEnabled}
              trackColor={{ false: colors.muted, true: colors.accent }}
              thumbColor={colors.card}
            />
          </View>

          <View style={{ gap: spacing[2] }}>
            <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground">
              Insight focus
            </Text>
            <View style={{ flexDirection: "row", gap: spacing[2] }}>
              {INSIGHT_FOCUS_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setInsightFocus(option.value)}
                  style={{
                    flex: 1,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderRadius: 14,
                    backgroundColor:
                      insightFocus === option.value ? colors.secondary : colors.card,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-xs font-sans-bold text-foreground">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button disabled={saveDisabled} onPress={handleSaveAccount}>
            {isAccountSaving ? "Saving..." : "Save account setup"}
          </Button>
        </Card>

        <Button tone="neutral" disabled={anyBusy} onPress={handleSignOut}>
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>

        <View className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-5">
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
      </ScrollView>
    </SafeAreaView>
  );
}

function parseAmount(value: string) {
  if (value.trim().length === 0) return 0;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
