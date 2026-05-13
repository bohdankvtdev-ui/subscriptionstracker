import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  CommonActions,
  useLinkBuilder,
} from "@react-navigation/native";
import { selectionAsync } from "expo-haptics";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  type EmitterSubscription,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tabBarIoniconName } from "@/config/tabs";
import { springTabFocus } from "@/constants/motion";
import { colors, components, neo, spacing } from "@/constants/theme";
import { Press3D } from "@/components/ui/Press3D";

const tabBar = components.tabBar;

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subs: EmitterSubscription[] = [
      Keyboard.addListener(show, () => setVisible(true)),
      Keyboard.addListener(hide, () => setVisible(false)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  return visible;
}

const CHIP = tabBar.chipSize;
const ICON = tabBar.iconSize;
const FAB = tabBar.fabSize;
const FAB_ICON = tabBar.fabIconSize;

type FloatingTabBarProps = BottomTabBarProps & {
  onPressCreate?: () => void;
};

/**
 * Custom floating tab bar: neo-brutalist capsule, paper active tile, Ionicons,
 * center FAB "+" (not a route) that overflows the track upward. Active chip
 * eases into a raised paper tile; the FAB uses Press3D for press depth.
 */
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  onPressCreate,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { buildHref } = useLinkBuilder();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const keyboardOpen = useKeyboardVisible();

  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const hideOnKeyboard = focusedOptions.tabBarHideOnKeyboard ?? false;
  const hiddenByKeyboard = hideOnKeyboard && keyboardOpen;

  const layoutWidth = windowWidth > 0 ? windowWidth : 390;

  const edgePad = useMemo(
    () =>
      Math.max(
        tabBar.horizontalInset,
        insets.left + spacing[2],
        insets.right + spacing[2],
      ),
    [insets.left, insets.right],
  );

  const barWidth = useMemo(() => {
    const available = Math.max(0, layoutWidth - 2 * edgePad);
    const fromFraction = Math.round(layoutWidth * tabBar.widthFraction);
    return Math.min(
      tabBar.maxWidth,
      Math.max(tabBar.minWidth, Math.min(fromFraction, available)),
    );
  }, [layoutWidth, edgePad]);

  const rawSafeBottom =
    Platform.OS === "android"
      ? Math.max(insets.bottom, spacing[2])
      : insets.bottom;

  const bottomPad = Math.max(
    rawSafeBottom +
      tabBar.bottomInsetNudge +
      tabBar.liftAboveSafeArea,
    spacing[2],
  );

  const onRootLayout = useCallback(
    (e: LayoutChangeEvent) => {
      onHeightChange?.(e.nativeEvent.layout.height);
    },
    [onHeightChange],
  );

  const createSlotIndex = Math.floor(state.routes.length / 2);

  const renderRouteSlot = (
    route: (typeof state.routes)[number],
    index: number,
  ) => {
    const focused = state.index === index;
    const { options } = descriptors[route.key];
    const label =
      typeof options.tabBarAccessibilityLabel === "string"
        ? options.tabBarAccessibilityLabel
        : typeof options.title === "string"
          ? options.title
          : route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        void selectionAsync();
        navigation.dispatch({
          ...CommonActions.navigate(route),
          target: state.key,
        });
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <TabChip
        key={route.key}
        focused={focused}
        href={buildHref(route.name, route.params)}
        accessibilityLabel={label}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        routeName={route.name}
      />
    );
  };

  const renderCreateSlot = () => (
    <View key="__create__" style={styles.fabSlot}>
      <Press3D
        accessibilityRole="button"
        accessibilityLabel="New subscription"
        testID="tab-create-fab"
        offset={tabBar.fabShadowOffset.width}
        radius={tabBar.fabRadius}
        shadowColor={colors.border}
        onPress={() => {
          void selectionAsync();
          onPressCreate?.();
        }}
        style={{
          width: FAB,
          height: FAB,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tabBar.fabBackground,
          borderWidth: tabBar.fabBorderWidth,
          borderColor: colors.border,
        }}
      >
        <Ionicons name="add" size={FAB_ICON} color={colors.foreground} />
      </Press3D>
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFillObject, styles.shell]}
    >
      <View
        pointerEvents={hiddenByKeyboard ? "none" : "box-none"}
        style={[
          styles.column,
          {
            paddingBottom: bottomPad,
            opacity: hiddenByKeyboard ? 0 : 1,
          },
        ]}
        onLayout={onRootLayout}
      >
        <View
          style={[
            styles.track,
            {
              width: barWidth,
              borderRadius: tabBar.capsuleRadius,
              borderWidth: tabBar.borderWidth,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const slot = renderRouteSlot(route, index);
            if (index === createSlotIndex - 1) {
              return [slot, renderCreateSlot()];
            }
            return slot;
          })}
        </View>
      </View>
    </View>
  );
}

type TabChipProps = {
  focused: boolean;
  href?: string;
  accessibilityLabel: string;
  testID?: string;
  onPress: () => void;
  onLongPress: () => void;
  routeName: string;
};

/**
 * Single tab chip. Idle chips are flat; focused chips ease into a raised
 * paper tile with a hard ink offset shadow. Pressing runs a short stamp.
 */
function TabChip({
  focused,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
  routeName,
}: TabChipProps) {
  const focus = useSharedValue(focused ? 1 : 0);
  const press = useSharedValue(0);

  useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, springTabFocus);
  }, [focused, focus]);

  const chipStyle = useAnimatedStyle(() => {
    const lift = focus.value * 2;
    const sink = press.value * 1.5;
    const scale = 1 + focus.value * 0.028 - press.value * 0.022;
    return {
      transform: [{ translateY: -lift + sink }, { scale }],
    };
  });

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: focus.value * (1 - press.value * 0.85),
    transform: [
      {
        translateY: focus.value * 0 + press.value * 2,
      },
      {
        translateX: press.value * 1,
      },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + focus.value * 0.45,
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        press.value = withTiming(1, {
          duration: 70,
          easing: Easing.out(Easing.quad),
        });
      }}
      onPressOut={() => {
        press.value = withTiming(0, {
          duration: 100,
          easing: Easing.out(Easing.cubic),
        });
      }}
      style={[styles.slot, { minHeight: CHIP }]}
    >
      <View style={styles.chipWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.chipShadow,
            {
              width: CHIP,
              height: CHIP,
              borderRadius: CHIP / 2,
            },
            shadowStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.chip,
            {
              width: CHIP,
              height: CHIP,
              borderRadius: CHIP / 2,
              backgroundColor: focused ? colors.card : "transparent",
              borderColor: colors.border,
              borderWidth: focused ? tabBar.chipFocusedBorderWidth : 0,
            },
            chipStyle,
          ]}
        >
          <Animated.View style={iconStyle}>
            <Ionicons
              name={tabBarIoniconName(routeName, focused)}
              size={ICON}
              color={colors.foreground}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  column: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[2],
    paddingVertical: tabBar.trackPaddingVertical,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: colors.border,
        shadowOffset: tabBar.shadowOffset,
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: `${tabBar.shadowOffset.width}px ${tabBar.shadowOffset.height}px 0 0 ${colors.border}`,
      },
    }),
  },
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  chipShadow: {
    position: "absolute",
    top: 3,
    left: 2,
    backgroundColor: neo.shadowColor,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -tabBar.fabLift,
  },
});
