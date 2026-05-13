import {
  Easing,
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from "react-native-reanimated";

/**
 * Shared motion tokens: cubic easing for enters (no spring overshoot),
 * higher-damping springs for press/tab feedback.
 */
export const springPressLift = {
  damping: 26,
  stiffness: 200,
  mass: 0.72,
} as const;

export const springTabFocus = {
  damping: 30,
  stiffness: 220,
  mass: 0.75,
} as const;

/** Layout when lists reorder / expand — short, no bounce */
export const layoutList = LinearTransition.duration(200).easing(
  Easing.out(Easing.cubic),
);

export const enterDown = FadeInDown.duration(260).easing(
  Easing.out(Easing.cubic),
);

export const enterUp = FadeInUp.duration(240).easing(Easing.out(Easing.cubic));

export const enterDownDelayed = (delayMs: number) =>
  FadeInDown.delay(delayMs)
    .duration(260)
    .easing(Easing.out(Easing.cubic));

export const enterUpDelayed = (delayMs: number) =>
  FadeInUp.delay(delayMs)
    .duration(240)
    .easing(Easing.out(Easing.cubic));

export const enterListItem = (index: number, baseDelay = 28, step = 16) =>
  FadeInUp.delay(baseDelay + index * step)
    .duration(200)
    .easing(Easing.out(Easing.cubic));
