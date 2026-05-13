import { type ReactNode, useEffect } from "react";
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { springPressLift } from "@/constants/motion";
import { neo } from "@/constants/theme";

type Press3DProps = {
  children: ReactNode;
  onPress?: (e?: GestureResponderEvent) => void;
  onLongPress?: (e?: GestureResponderEvent) => void;
  disabled?: boolean;
  /** Bottom-right offset in px for the hard shadow tile. Defaults to neo.offset. */
  offset?: number;
  /** Border radius shared by tile and shadow tile. */
  radius?: number;
  /** Hard shadow tile color. */
  shadowColor?: string;
  /** When true, the tile floats slightly higher (spring) and shadow is brighter. */
  active?: boolean;
  /** Extra translateY applied when `active` is true (negative = up). */
  activeLift?: number;
  /** Style for the tile (background, padding, border live here). */
  style?: StyleProp<ViewStyle>;
  /** Style for the outer wrapper (margin / alignment). */
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityRole?:
    | "button"
    | "link"
    | "tab"
    | "switch"
    | "image"
    | "header"
    | "summary"
    | "none";
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  testID?: string;
  hitSlop?: number;
};

/**
 * Neo-brutalist 3D press primitive. Renders a tile above a hard offset shadow
 * tile; on press the tile translates into the shadow and the shadow fades out.
 * When `active`, the tile lifts slightly with a damped spring so selected surfaces
 * read as "raised" relative to their idle neighbours.
 */
export function Press3D({
  children,
  onPress,
  onLongPress,
  disabled = false,
  offset = neo.offset,
  radius = neo.radius,
  shadowColor = neo.shadowColor,
  active = false,
  activeLift = 2,
  style,
  containerStyle,
  accessibilityRole = "button",
  accessibilityLabel,
  accessibilityState,
  testID,
  hitSlop,
}: Press3DProps) {
  const pressed = useSharedValue(0);
  const lift = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    lift.value = withSpring(active ? 1 : 0, springPressLift);
  }, [active, lift]);

  const tileStyle = useAnimatedStyle(() => {
    const tx = pressed.value * offset;
    const ty = pressed.value * offset - lift.value * activeLift;
    const scale = 1 - pressed.value * 0.006 + lift.value * 0.008;
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale }],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const baseOpacity = disabled ? 0.25 : 1;
    return {
      opacity: (1 - pressed.value) * baseOpacity,
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    pressed.value = withTiming(1, {
      duration: neo.pressMs,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, {
      duration: neo.releaseMs,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
      testID={testID}
      hitSlop={hitSlop}
      style={containerStyle}
    >
      <View
        style={{
          paddingRight: offset,
          paddingBottom: offset,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: offset,
              left: offset,
              right: 0,
              bottom: 0,
              borderRadius: radius,
              backgroundColor: shadowColor,
            },
            shadowStyle,
          ]}
        />
        <Animated.View style={[{ borderRadius: radius }, style, tileStyle]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}

export default Press3D;
