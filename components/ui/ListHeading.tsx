import { Text, View } from "react-native";
import { Press3D } from "@/components/ui/Press3D";
import { colors, neo } from "@/constants/theme";

export default function ListHeading({ title }: { title: string }) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      <Press3D
        offset={neo.offsetXs}
        radius={12}
        shadowColor={neo.shadowColor}
        style={{
          backgroundColor: "#fef3c7",
          borderWidth: neo.borderLight,
          borderColor: colors.border,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
        accessibilityLabel={`View all ${title}`}
      >
        <Text className="list-action-text">View All</Text>
      </Press3D>
    </View>
  );
}
