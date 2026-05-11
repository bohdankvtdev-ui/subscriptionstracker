import type { Ref } from "react";
import React from "react";
import { colors } from "@/constants/theme";
import cn from "clsx";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type AuthPasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  clientError: string | null;
  serverError?: string | null;
  editable: boolean;
  /** "current-password" for sign-in, "new-password" for sign-up */
  autoComplete: "current-password" | "new-password";
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done" | "go";
  inputRef?: Ref<TextInput>;
};

export function AuthPasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  clientError,
  serverError,
  editable,
  autoComplete,
  onSubmitEditing,
  returnKeyType = "done",
  inputRef,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const hasError = !!(clientError || serverError);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View style={styles.wrap}>
        <TextInput
          ref={inputRef}
          className={cn("auth-input", hasError && "auth-input-error")}
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={autoComplete === "new-password" ? "newPassword" : "password"}
          autoComplete={autoComplete}
          editable={editable}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          style={styles.toggle}
          onPress={() => setVisible((v) => !v)}
          disabled={!editable}
        >
          <Text className="text-sm font-sans-semibold text-accent">
            {visible ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>
      {clientError ? <Text className="auth-error">{clientError}</Text> : null}
      {serverError ? <Text className="auth-error">{serverError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    width: "100%",
  },
  input: {
    paddingRight: 72,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
