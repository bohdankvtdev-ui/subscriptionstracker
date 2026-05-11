import "@/global.css";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import {
  getClerkErrorMessage,
  postAuthNavigate,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/auth";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { authScrollContent, colors, screenFill } from "@/constants/theme";
import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);

  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  const onAuthNavigate = React.useMemo(
    () => postAuthNavigate(router),
    [router],
  );

  const busy = fetchStatus === "fetching";

  const handleSubmit = async () => {
    const eErr = validateEmail(emailAddress);
    const pErr = validatePassword(password);
    const cErr = validatePasswordConfirm(password, confirmPassword);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmError(cErr);
    setRegisterError(null);
    if (eErr || pErr || cErr) return;

    const { error } = await signUp!.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) {
      setRegisterError(
        getClerkErrorMessage(error) ??
          "Could not create your account. Try a different email or password.",
      );
      return;
    }

    await signUp!.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setVerifyError(null);

    try {
      await signUp!.verifications.verifyEmailCode({
        code: trimmed,
      });
    } catch (e) {
      setVerifyError(
        getClerkErrorMessage(e) ?? "Invalid or expired code. Try again.",
      );
      return;
    }

    if (signUp!.status === "complete") {
      await signUp!.finalize({
        navigate: onAuthNavigate,
      });
    } else {
      setVerifyError(
        "Verification did not complete. Check the code or request a new one.",
      );
    }
  };

  if (!clerkLoaded || !signUp) {
    return <FullScreenLoader />;
  }

  if (signUp.status === "complete" || isSignedIn) {
    return <FullScreenLoader />;
  }

  const awaitingEmailCode =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (awaitingEmailCode) {
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
              title="Check your inbox"
              subtitle="We sent a verification code to your email. Enter it below to activate your account."
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
                    value={code}
                    placeholder="Enter the code"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={(t) => {
                      setCode(t);
                      setVerifyError(null);
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    editable={!busy}
                  />
                  {verifyError ? (
                    <Text className="auth-error">{verifyError}</Text>
                  ) : null}
                  {errors.fields.code ? (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Verify and continue"
                  className={cn(
                    "auth-button",
                    (!code.trim() || busy) && "auth-button-disabled",
                  )}
                  disabled={!code.trim() || busy}
                  onPress={handleVerify}
                >
                  <Text className="auth-button-text">Verify and continue</Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  disabled={busy}
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="auth-link-row">
              <Text className="auth-link-copy">Need to fix your email?</Text>
              <Link href="/sign-in" replace asChild>
                <Pressable hitSlop={8} disabled={busy}>
                  <Text className="auth-link">Start over</Text>
                </Pressable>
              </Link>
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
            title="Create your account"
            subtitle="Track renewals, see what's due, and stay in control of spending."
          />

          <View className="auth-card">
            <View className="auth-form">
              {registerError ? (
                <Text className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-sans-medium text-destructive">
                  {registerError}
                </Text>
              ) : null}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={cn(
                    "auth-input",
                    (emailError || errors.fields.emailAddress) && "auth-input-error",
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
                    setRegisterError(null);
                  }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  editable={!busy}
                />
                {emailError ? (
                  <Text className="auth-error">{emailError}</Text>
                ) : null}
                {errors.fields.emailAddress ? (
                  <Text className="auth-error">
                    {errors.fields.emailAddress.message}
                  </Text>
                ) : null}
              </View>

              <View>
                <AuthPasswordField
                  label="Password"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setPasswordError(null);
                    setRegisterError(null);
                  }}
                  placeholder="Create a password"
                  clientError={passwordError}
                  serverError={errors.fields.password?.message ?? null}
                  editable={!busy}
                  autoComplete="new-password"
                  inputRef={passwordInputRef}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                />
                <Text className="auth-helper">
                  At least 8 characters. Use a mix of letters and numbers for a
                  stronger password.
                </Text>
              </View>

              <AuthPasswordField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setConfirmError(null);
                  setRegisterError(null);
                }}
                placeholder="Re-enter your password"
                clientError={confirmError}
                editable={!busy}
                autoComplete="new-password"
                inputRef={confirmPasswordInputRef}
                returnKeyType="go"
                onSubmitEditing={() => {
                  void handleSubmit();
                }}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue to email verification"
                className={cn("auth-button", busy && "auth-button-disabled")}
                disabled={busy}
                onPress={handleSubmit}
              >
                <Text className="auth-button-text">Continue</Text>
              </Pressable>

              <View nativeID="clerk-captcha" />
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
