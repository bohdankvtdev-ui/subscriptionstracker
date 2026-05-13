import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { Image, View, type ImageSourcePropType } from "react-native";
import {
  getIconAssetIfImage,
  getIconColor,
  getIconImageSource,
  getSubscriptionIconOption,
} from "@/constants/icons";

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type SubscriptionIconProps = {
  iconKey?: string | null;
  source?: ImageSourcePropType;
  size?: number;
  color?: string;
};

export function SubscriptionIcon({
  iconKey,
  source,
  size = 36,
  color,
}: SubscriptionIconProps) {
  const imageSource = getIconAssetIfImage(iconKey) ?? source;

  if (imageSource && getIconAssetIfImage(iconKey)) {
    return <Image source={imageSource} style={{ width: size, height: size }} />;
  }

  const option = getSubscriptionIconOption(iconKey);

  if (option.type === "image") {
    return (
      <Image
        source={imageSource ?? getIconImageSource(option.key)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <MaterialCommunityIcons
        name={option.name as MaterialIconName}
        size={Math.round(size * 0.82)}
        color={color ?? getIconColor(iconKey)}
      />
    </View>
  );
}

export default SubscriptionIcon;
