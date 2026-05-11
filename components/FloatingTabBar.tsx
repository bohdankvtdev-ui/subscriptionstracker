import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  CommonActions,
  useLinkBuilder,
} from "@react-navigation/native";
import { PlatformPressable } from "@react-navigation/elements";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tabBarIoniconName } from "@/config/tabs";
import { colors, components, spacing } from "@/constants/theme";

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
 * center FAB "+" (not a route) that overflows the track upward.
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

  // Bottom padding: safe-area + theme nudge + lift; `bottomInsetNudge` is the visible vertical tweak.
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

  // Splice the synthetic "+" slot into the middle position so the visual order
  // becomes: Home, Subscriptions, +, Insights, Settings. The "+" is not a route.
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
      <PlatformPressable
        key={route.key}
        href={buildHref(route.name, route.params)}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        testID={options.tabBarButtonTestID}
        android_ripple={
          Platform.OS === "android"
            ? { color: `${colors.foreground}18`, borderless: true }
            : undefined
        }
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.slot, { minHeight: CHIP }]}
      >
        <View
          style={[
            styles.chip,
            { width: CHIP, height: CHIP, borderRadius: CHIP / 2 },
            focused ? styles.chipFocused : styles.chipIdle,
          ]}
        >
          <Ionicons
            name={tabBarIoniconName(route.name, focused)}
            size={ICON}
            color={colors.foreground}
            style={{ opacity: focused ? 1 : 0.55 }}
          />
        </View>
      </PlatformPressable>
    );
  };

  const renderCreateSlot = () => {
    return (
      <View key="__create__" style={styles.fabSlot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New subscription"
          testID="tab-create-fab"
          onPress={() => {
            void selectionAsync();
            onPressCreate?.();
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              width: FAB,
              height: FAB,
              borderRadius: tabBar.fabRadius,
              transform: [{ translateY: pressed ? 1 : 0 }],
            },
          ]}
        >
          <Ionicons name="add" size={FAB_ICON} color={colors.foreground} />
        </Pressable>
      </View>
    );
  };

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
  chip: {
    alignItems: "center",
    justifyContent: "center",
  },
  chipFocused: {
    backgroundColor: colors.card,
    borderWidth: tabBar.chipFocusedBorderWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.border,
        shadowOffset: tabBar.chipFocusedShadowOffset,
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 6,
      },
      default: {
        boxShadow: `${tabBar.chipFocusedShadowOffset.width}px ${tabBar.chipFocusedShadowOffset.height}px 0 0 ${colors.border}`,
      },
    }),
  },
  chipIdle: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  fabSlot: {
    // Same flex weight as a sibling tab so spacing stays even.
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // Negative top margin lifts the FAB above the capsule top without growing
    // the capsule itself. `overflow: visible` on `track` keeps it rendered.
    marginTop: -tabBar.fabLift,
  },
  fab: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tabBar.fabBackground,
    borderWidth: tabBar.fabBorderWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.border,
        shadowOffset: tabBar.fabShadowOffset,
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 10,
      },
      default: {
        boxShadow: `${tabBar.fabShadowOffset.width}px ${tabBar.fabShadowOffset.height}px 0 0 ${colors.border}`,
      },
    }),
  },
});
