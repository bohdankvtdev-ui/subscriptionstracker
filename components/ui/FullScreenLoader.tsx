import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

type FullScreenLoaderProps = {
  /** Shown after a delay when auth (or similar) is still loading — helps debug stuck JS / network. */
  slowHint?: string;
};

export function FullScreenLoader({ slowHint }: FullScreenLoaderProps) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={colors.primary} />
      {slowHint ? <Text style={styles.hint}>{slowHint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    ...(Platform.OS === "web"
      ? { minHeight: "100vh" as unknown as number }
      : {}),
  },
  hint: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: colors.foreground,
    opacity: 0.75,
    maxWidth: 320,
  },
});
