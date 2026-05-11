import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { screenFill, spacing } from "@/constants/theme";

type Props = {
  title: string;
  subtitle: string;
};

export function ComingSoon({ title, subtitle }: Props) {
  return (
    <SafeAreaView
      style={[screenFill, { padding: spacing[5] }]}
      edges={["top", "left", "right"]}
    >
      <Text className="text-2xl font-sans-bold tracking-tight text-foreground">
        {title}
      </Text>
      <Text className="mt-2 max-w-sm text-base font-sans-medium text-muted-foreground">
        {subtitle}
      </Text>
    </SafeAreaView>
  );
}
