import { Text, View } from "react-native";
import type { UpcomingSubscriptionCardProps } from "@/domain/subscription";
import { formatCurrency } from "@/lib/format";
import { Press3D } from "@/components/ui/Press3D";
import { colors, neo } from "@/constants/theme";
import { SubscriptionIcon } from "@/components/subscriptions/SubscriptionIcon";
import { getIconBackgroundColor, getIconColor } from "@/constants/icons";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  iconKey,
  currency,
  onPress,
}: UpcomingSubscriptionCardProps) => {
  const iconColor = getIconColor(iconKey);
  const iconBackground = getIconBackgroundColor(iconKey);

  const timing =
    daysLeft <= 0
      ? "Due today"
      : daysLeft === 1
        ? "Tomorrow"
        : `${daysLeft} days`;

  return (
    <Press3D
      onPress={onPress}
      disabled={!onPress}
      offset={neo.offsetSm}
      radius={neo.radiusLg}
      shadowColor={neo.shadowColor}
      containerStyle={{ marginRight: 16 }}
      style={{
        width: 176,
        backgroundColor: "#dbeafe",
        borderWidth: neo.border,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <View className="upcoming-row">
        <View
          style={{
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 12,
            backgroundColor: iconBackground,
            overflow: "hidden",
          }}
        >
          <View className="upcoming-icon items-center justify-center">
            <SubscriptionIcon
              iconKey={iconKey}
              source={icon}
              size={38}
              color={iconColor}
            />
          </View>
        </View>
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {timing}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </Press3D>
  );
};

export default UpcomingSubscriptionCard;
