import { type ReactNode } from "react";
import { Text, type StyleProp, type ViewStyle } from "react-native";
import { Press3D } from "@/components/ui/Press3D";
import { colors, neo } from "@/constants/theme";

type ButtonTone = "primary" | "secondary" | "neutral";

type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const toneStyles: Record<ButtonTone, { backgroundColor: string; color: string }> =
  {
    primary: {
      backgroundColor: colors.primary,
      color: colors.primaryForeground,
    },
    secondary: {
      backgroundColor: colors.accent,
      color: colors.foreground,
    },
    neutral: {
      backgroundColor: colors.card,
      color: colors.foreground,
    },
  };

export function Button({
  children,
  onPress,
  tone = "primary",
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const toneStyle = toneStyles[tone];

  return (
    <Press3D
      onPress={onPress}
      disabled={disabled}
      offset={neo.offsetSm}
      radius={neo.radius}
      shadowColor={neo.shadowColor}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          borderWidth: neo.border,
          borderColor: colors.border,
          backgroundColor: toneStyle.backgroundColor,
          paddingHorizontal: 18,
          paddingVertical: 12,
          opacity: disabled ? 0.65 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: toneStyle.color,
          fontFamily: "Montserrat_700Bold",
          fontSize: 15,
        }}
      >
        {children}
      </Text>
    </Press3D>
  );
}

export default Button;
