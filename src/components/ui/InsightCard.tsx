import { Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import type { InsightSeverity } from "@/src/features/insights/insights.types";
import { Card } from "./Card";

type InsightCardProps = {
  title: string;
  description: string;
  impactLabel: string;
  severity?: InsightSeverity;
};

const severityTone: Record<InsightSeverity, "paper" | "mint" | "amber"> = {
  info: "paper",
  warning: "amber",
  saving: "mint",
};

export function InsightCard({
  title,
  description,
  impactLabel,
  severity = "info",
}: InsightCardProps) {
  return (
    <Card tone={severityTone[severity]}>
      <View style={{ gap: spacing[3] }}>
        <View style={{ gap: spacing[1] }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Montserrat_800ExtraBold",
              fontSize: 18,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Montserrat_500Medium",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {description}
          </Text>
        </View>
        <View
          style={{
            alignSelf: "flex-start",
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 999,
            backgroundColor: colors.card,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Montserrat_700Bold",
              fontSize: 12,
            }}
          >
            {impactLabel}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default InsightCard;
