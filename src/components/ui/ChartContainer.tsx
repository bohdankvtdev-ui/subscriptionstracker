import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { Card } from "./Card";

type ChartContainerProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartContainer({
  title,
  subtitle,
  children,
}: ChartContainerProps) {
  return (
    <Card contentStyle={{ gap: spacing[4] }}>
      <View style={{ gap: spacing[1] }}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Montserrat_800ExtraBold",
            fontSize: 20,
            letterSpacing: -0.4,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Montserrat_500Medium",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

export default ChartContainer;
