import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { enterDown, enterUpDelayed } from "@/constants/motion";
import { Press3D } from "@/components/ui/Press3D";
import { icons } from "@/constants/icons";
import { colors, neo, screenFill, spacing } from "@/constants/theme";

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
      <Animated.View entering={enterDown}>
        <Press3D
          offset={neo.offsetSm}
          radius={20}
          shadowColor={neo.shadowColor}
          style={{
            backgroundColor: "#fef3c7",
            borderWidth: neo.border,
            borderColor: colors.border,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              borderWidth: neo.borderLight,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={icons.activity}
              style={{ width: 32, height: 32 }}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text className="text-xs font-sans-bold uppercase tracking-wider text-primary">
              Coming soon
            </Text>
            <Text
              numberOfLines={1}
              className="mt-1 text-2xl font-sans-bold tracking-tight text-foreground"
            >
              {title}
            </Text>
          </View>
        </Press3D>
      </Animated.View>

      <Animated.View entering={enterUpDelayed(80)}>
        <Text className="mt-5 max-w-md text-base font-sans-medium text-muted-foreground">
          {subtitle}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
