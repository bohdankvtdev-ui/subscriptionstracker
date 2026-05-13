import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { SubscriptionCardProps } from "@/domain/subscription";
import { layoutList } from "@/constants/motion";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/format";
import { Press3D } from "@/components/ui/Press3D";
import { colors, neo } from "@/constants/theme";
import { SubscriptionIcon } from "@/components/subscriptions/SubscriptionIcon";
import { getIconBackgroundColor, getIconColor } from "@/constants/icons";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  iconKey,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
  onCancelPress,
  onDeletePress,
  isCancelling,
  isDeleting,
}: SubscriptionCardProps) => {
  const tileBg = expanded
    ? "#a7f3d0"
    : color ?? colors.card;
  const iconColor = getIconColor(iconKey);
  const iconBackground = getIconBackgroundColor(iconKey);

  return (
    <Press3D
      onPress={onPress}
      offset={neo.offset}
      radius={neo.radiusLg}
      shadowColor={neo.shadowColor}
      active={expanded}
      activeLift={1.5}
      accessibilityRole="button"
      accessibilityState={{ selected: expanded }}
      style={{
        backgroundColor: tileBg,
        borderWidth: neo.border,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <Animated.View layout={layoutList}>
        <View className="sub-head">
          <View className="sub-main">
            <View
              style={{
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 14,
                backgroundColor: iconBackground,
                overflow: "hidden",
              }}
            >
              <View className="sub-icon items-center justify-center">
                <SubscriptionIcon
                  iconKey={iconKey}
                  source={icon}
                  size={42}
                  color={iconColor}
                />
              </View>
            </View>
            <View className="sub-copy">
              <Text numberOfLines={1} className="sub-title">
                {name}
              </Text>
              <Text
                numberOfLines={1}
                className="sub-meta"
                ellipsizeMode="tail"
              >
                {category?.trim() ||
                  plan?.trim() ||
                  (renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : "")}
              </Text>
            </View>
          </View>
          <View className="sub-price-box">
            <Text className="sub-price">{formatCurrency(price, currency)}</Text>
            <Text className="sub-billing">{billing}</Text>
          </View>
        </View>

        {expanded ? (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            className="sub-body"
          >
            <View className="sub-details">
              <DetailRow
                label="Payment"
                value={paymentMethod?.trim() || "Not provided"}
              />
              <DetailRow
                label="Category"
                value={category?.trim() || plan?.trim() || "Not provided"}
              />
              <DetailRow
                label="Started"
                value={
                  startDate ? formatSubscriptionDateTime(startDate) : "Not provided"
                }
              />
              <DetailRow
                label="Renewal"
                value={
                  renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : "Not provided"
                }
              />
              <DetailRow
                label="Status"
                value={status ? formatStatusLabel(status) : "Not provided"}
              />
            </View>
            {onCancelPress || onDeletePress ? (
              <View className="mt-4 flex-row gap-3">
                {onCancelPress ? (
                  <Pressable
                    onPress={onCancelPress}
                    disabled={isCancelling}
                    className="flex-1 items-center rounded-2xl border-2 border-border bg-card py-3"
                  >
                    <Text className="text-sm font-sans-bold text-foreground">
                      {isCancelling
                        ? "Updating..."
                        : status === "active"
                          ? "Pause"
                          : status === "paused"
                            ? "Resume"
                            : "Mark active"}
                    </Text>
                  </Pressable>
                ) : null}
                {onDeletePress ? (
                  <Pressable
                    onPress={onDeletePress}
                    disabled={isDeleting}
                    className="flex-1 items-center rounded-2xl border-2 border-destructive bg-destructive/10 py-3"
                  >
                    <Text className="text-sm font-sans-bold text-destructive">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </Animated.View>
    </Press3D>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="sub-row">
      <View className="sub-row-copy">
        <Text className="sub-label">{label}</Text>
        <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default SubscriptionCard;
