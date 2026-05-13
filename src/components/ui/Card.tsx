import { type ReactNode } from "react";
import {
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, neo } from "@/constants/theme";

type CardTone = "paper" | "mint" | "sky" | "amber" | "muted";

type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  radius?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
};

const toneBackground: Record<CardTone, string> = {
  paper: colors.card,
  mint: colors.accent,
  sky: colors.secondary,
  amber: colors.chart4,
  muted: colors.muted,
};

export function Card({
  children,
  tone = "paper",
  radius = neo.radiusLg,
  offset = neo.offset,
  style,
  contentStyle,
  accessibilityRole,
  accessibilityLabel,
}: CardProps) {
  return (
    <View
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[{ paddingRight: offset, paddingBottom: offset }, style]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: offset,
          left: offset,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          backgroundColor: neo.shadowColor,
        }}
      />
      <View
        style={[
          {
            borderRadius: radius,
            borderWidth: neo.border,
            borderColor: colors.border,
            backgroundColor: toneBackground[tone],
            padding: 16,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default Card;
