import "@/global.css";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import {
  getClerkErrorMessage,
  postAuthNavigate,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { authScrollContent, colors, screenFill } from "@/constants/theme";
import { useAuth, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cn from "clsx";

function mfaStrategy(
  factors: { strategy: string }[] | null | undefined,
): "phone_code" | "totp" | "backup_code" | null {
  const list = factors ?? [];
  if (list.some((x) => x.strategy === "phone_code")) return "phone_code";
  if (list.some((x) => x.strategy === "totp")) return "totp";
  if (list.some((x) => x.strategy === "backup_code")) return "backup_code";
  return null;
}

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded: clerkLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [signInError, setSignInError] = React.useState<string | null>(null);
  const [stepError, setStepError] = React.useState<string | null>(null);

  const passwordInputRef = React.useRef<TextInput>(null);
  const phonePromptSentRef = React.useRef(false);

  const onAuthNavigate = React.useMemo(
    () => postAuthNavigate(router),
    [router],
  );

  const finalizeIfComplete = React.useCallback(async () => {
    if (signIn?.status !== "complete") return;
    await signIn.finalize({
      navigate: onAuthNavigate,
    });
  }, [signIn, onAuthNavigate]);

  React.useEffect(() => {
    if (signIn?.status !== "needs_second_factor") {
      phonePromptSentRef.current = false;
      return;
    }
    const strategy = mfaStrategy(signIn.supportedSecondFactors);
    if (strategy !== "phone_code" || phonePromptSentRef.current) return;
    phonePromptSentRef.current = true;
    void signIn.mfa.sendPhoneCode();
  }, [signIn?.status, signIn]);

  const handlePasswordSignIn = async () => {
    const eErr = validateEmail(emailAddress);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setSignInError(null);
    if (eErr || pErr) return;

    const { error } = await signIn!.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) {
      setSignInError(
        getClerkErrorMessage(error) ??
          "Could not sign you in. Check your email and password.",
      );
      return;
    }

    if (signIn!.status === "complete") {
      await signIn!.finalize({
        navigate: onAuthNavigate,
      });
      return;
    }

    if (signIn!.status === "needs_second_factor") {
      const strategy = mfaStrategy(signIn!.supportedSecondFactors);
      if (strategy === "phone_code" && !phonePromptSentRef.current) {
        phonePromptSentRef.current = true;
        await signIn!.mfa.sendPhoneCode();
      }
      return;
    }

    if (signIn!.status === "needs_client_trust") {
      const emailCodeFactor = signIn!.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn!.mfa.sendEmailCode();
      }
      return;
    }

    setSignInError(
      "Sign-in could not continue. Try again or reset your password from the web.",
    );
  };

  const handleTrustVerify = async () => {
    setStepError(null);
    try {
      await signIn!.mfa.verifyEmailCode({ code: verificationCode.trim() });
      await finalizeIfComplete();
    } catch (e) {
      setStepError(
        getClerkErrorMessage(e) ?? "Invalid or expired code. Try again.",
      );
    }
  };

  const handleMfaVerify = async () => {
    setStepError(null);
    const code = verificationCode.trim();
    const strategy = mfaStrategy(signIn!.supportedSecondFactors);
    try {
      if (strategy === "phone_code") {
        await signIn!.mfa.verifyPhoneCode({ code });
      } else if (strategy === "totp") {
        await signIn!.mfa.verifyTOTP({ code });
      } else if (strategy === "backup_code") {
        await signIn!.mfa.verifyBackupCode({ code });
      } else {
        return;
      }
      await finalizeIfComplete();
    } catch (e) {
      setStepError(
        getClerkErrorMessage(e) ?? "Invalid code. Try again or request a new one.",
      );
    }
  };

  const busy = fetchStatus === "fetching";

  if (!clerkLoaded || !signIn) {
    return <FullScreenLoader />;
  }

  const secondFactorStrategy = mfaStrategy(signIn.supportedSecondFactors);

  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView style={screenFill} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={screenFill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={screenFill}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={authScrollContent}
          >
            <AuthBrandHeader
              title="Confirm it's you"
              subtitle="Enter the verification code we emailed you to finish signing in on this device."
            />
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={cn(
                      "auth-input",
                      errors.fields.code && "auth-input-error",
                    )}
                    value={verificationCode}
                    placeholder="Enter the code"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={(t) => {
                      setVerificationCode(t);
                      setStepError(null);
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    editable={!busy}
                  />
                  {stepError ? (
                    <Text className="auth-error">{stepError}</Text>
                  ) : null}
                  {errors.fields.code ? (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                  className={cn(
                    "auth-button",
                    (!verificationCode.trim() || busy) && "auth-button-disabled",
                  )}
                  disabled={!verificationCode.trim() || busy}
                  onPress={handleTrustVerify}
                >
                  <Text className="auth-button-text">Continue</Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  disabled={busy}
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  disabled={busy}
                  onPress={() => {
                    setVerificationCode("");
                    void signIn.reset();
                  }}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (signIn.status === "needs_second_factor") {
    if (!secondFactorStrategy) {
      return (
        <SafeAreaView style={screenFill} edges={["top", "bottom"]}>
          <ScrollView
            style={screenFill}
            keyboardDismissMode="on-drag"
            contentContainerStyle={authScrollContent}
          >
            <AuthBrandHeader
              title="Extra verification required"
              subtitle="This account uses a sign-in step we don't support in the app yet. Please reset the flow or use another method from your dashboard."
            />
            <View className="auth-card">
              <Pressable
                className="auth-button"
                onPress={() => {
                  setVerificationCode("");
                  void signIn.reset();
                }}
              >
                <Text className="auth-button-text">Start over</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    const mfaSubtitle =
      secondFactorStrategy === "phone_code"
        ? "Enter the code we sent to your phone."
        : secondFactorStrategy === "totp"
          ? "Enter the code from your authenticator app."
          : "Enter one of your backup codes.";

    return (
      <SafeAreaView style={screenFill} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={screenFill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={screenFill}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={authScrollContent}
          >
            <AuthBrandHeader
              title="Two-step verification"
              subtitle={mfaSubtitle}
            />
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={cn(
                      "auth-input",
                      errors.fields.code && "auth-input-error",
                    )}
                    value={verificationCode}
                    placeholder="Enter the code"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={(t) => {
                      setVerificationCode(t);
                      setStepError(null);
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    editable={!busy}
                  />
                  {stepError ? (
                    <Text className="auth-error">{stepError}</Text>
                  ) : null}
                  {errors.fields.code ? (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                  className={cn(
                    "auth-button",
                    (!verificationCode.trim() || busy) && "auth-button-disabled",
                  )}
                  disabled={!verificationCode.trim() || busy}
                  onPress={handleMfaVerify}
                >
                  <Text className="auth-button-text">Continue</Text>
                </Pressable>
                {secondFactorStrategy === "phone_code" ? (
                  <Pressable
                    className="auth-secondary-button"
                    disabled={busy}
                    onPress={() => signIn.mfa.sendPhoneCode()}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  className="auth-secondary-button"
                  disabled={busy}
                  onPress={() => {
                    setVerificationCode("");
                    void signIn.reset();
                  }}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenFill} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={screenFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={screenFill}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={authScrollContent}
        >
          <AuthBrandHeader
            title="Welcome back"
            subtitle="Sign in to continue managing your subscriptions."
          />

          <View className="auth-card">
            <View className="auth-form">
              {signInError ? (
                <Text className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-sans-medium text-destructive">
                  {signInError}
                </Text>
              ) : null}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={cn(
                    "auth-input",
                    (emailError || errors.fields.identifier) && "auth-input-error",
                  )}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  onChangeText={(t) => {
                    setEmailAddress(t);
                    setEmailError(null);
                    setSignInError(null);
                  }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  editable={!busy}
                />
                {emailError ? (
                  <Text className="auth-error">{emailError}</Text>
                ) : null}
                {errors.fields.identifier ? (
                  <Text className="auth-error">
                    {errors.fields.identifier.message}
                  </Text>
                ) : null}
              </View>

              <AuthPasswordField
                label="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setPasswordError(null);
                  setSignInError(null);
                }}
                placeholder="Enter your password"
                clientError={passwordError}
                serverError={errors.fields.password?.message ?? null}
                editable={!busy}
                autoComplete="current-password"
                inputRef={passwordInputRef}
                returnKeyType="go"
                onSubmitEditing={() => {
                  void handlePasswordSignIn();
                }}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                className={cn(
                  "auth-button",
                  busy && "auth-button-disabled",
                )}
                disabled={busy}
                onPress={handlePasswordSignIn}
              >
                <Text className="auth-button-text">Sign in</Text>
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New here?</Text>
            <Link href="/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
