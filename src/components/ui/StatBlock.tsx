import { Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { Card } from "./Card";

type StatBlockProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "paper" | "mint" | "sky" | "amber" | "muted";
};

export function StatBlock({
  label,
  value,
  detail,
  tone = "paper",
}: StatBlockProps) {
  return (
    <Card tone={tone} contentStyle={{ minHeight: 112, justifyContent: "space-between" }}>
      <View style={{ gap: spacing[2] }}>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Montserrat_700Bold",
            fontSize: 12,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            color: colors.foreground,
            fontFamily: "Montserrat_800ExtraBold",
            fontSize: 30,
            letterSpacing: -1,
          }}
        >
          {value}
        </Text>
      </View>
      {detail ? (
        <Text
          numberOfLines={2}
          style={{
            color: colors.foreground,
            fontFamily: "Montserrat_600SemiBold",
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {detail}
        </Text>
      ) : null}
    </Card>
  );
}

export default StatBlock;
