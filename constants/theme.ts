/**
 * Hex mirrors of `global.css` `:root` — colorful soft neo-brutalist / Notion-like palette.
 */
export const colors = {
    background: "#f4f1ea",
    foreground: "#1c2220",
    card: "#fffdf8",
    cardForeground: "#1c2220",
    popover: "#fffdf8",
    popoverForeground: "#1c2220",
    primary: "#0f766e",
    primaryForeground: "#f0fdf9",
    secondary: "#bae6fd",
    secondaryForeground: "#0c4a6e",
    muted: "#e8e4dc",
    mutedForeground: "#4b5552",
    accent: "#6ee7b7",
    accentForeground: "#064e3b",
    destructive: "#dc5b52",
    destructiveForeground: "#fff8f6",
    border: "#3f3a36",
    input: "#ede8df",
    ring: "#0f766e",
    chart1: "#0f766e",
    chart2: "#0ea5e9",
    chart3: "#34d399",
    chart4: "#fbbf77",
    chart5: "#818cf8",
    subscription: "#a7f3d0",
    success: "#15803d",
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
} as const;

/**
 * Neo-brutalist 3D primitive tokens. Tiles sit above hard offset shadow blocks;
 * pressing translates the tile by `offset` into its shadow.
 */
export const neo = {
    border: 2.5,
    borderLight: 2,
    borderHeavy: 3,
    radiusSm: 12,
    radius: 16,
    radiusLg: 20,
    radiusXl: 24,
    offsetXs: 3,
    offsetSm: 4,
    offset: 5,
    offsetLg: 6,
    /** Slightly snappier press so tiles feel responsive without a long “bounce back”. */
    pressMs: 72,
    releaseMs: 105,
    shadowColor: "#1c2220",
} as const;

export const components = {
    /**
     * Floating capsule tab bar. On wide phones width is capped and centered so the pill
     * does not stretch edge-to-edge (e.g. iPhone Pro Max).
     *
     * Neo-brutalist minimal: thick ink border, sharp offset stamp shadow, active tab
     * as a raised paper tile; monochrome Ionicons.
     */
    tabBar: {
        chipSize: 46,
        iconSize: 26,
        /** Compact vertical padding inside the capsule — keeps bar height tight. */
        trackPaddingVertical: spacing[1],
        horizontalInset: spacing[4],
        /** Responsive width: at least `minWidth`, at most `maxWidth`, prefer `widthFraction` of screen. */
        minWidth: 280,
        maxWidth: 392,
        widthFraction: 0.92,
        capsuleRadius: 9999,
        borderWidth: 2.5,
        /** Sharp neo-brutalist offset stamp under the capsule. */
        shadowOffset: { width: 4, height: 4 },
        /** Neo-brutalist 3D stamp under the active chip (white tile, ink border + shadow). */
        chipFocusedBorderWidth: 2,
        chipFocusedShadowOffset: { width: 2, height: 2 },
        /** Center FAB (`+`) — overflows the capsule upward without changing bar height. */
        fabSize: 56,
        fabRadius: 16,
        fabIconSize: 30,
        fabLift: 14,
        fabBorderWidth: 2.5,
        fabShadowOffset: { width: 3, height: 3 },
        fabBackground: colors.accent,
        /** Extra gap above the home indicator / gesture bar (shadow clearance). */
        liftAboveSafeArea: spacing[1],
        /**
         * Added to `insets.bottom` before padding. Negative pulls the bar toward the
         * physical bottom (visible move on iPhone; `liftAboveSafeArea` alone barely changes).
         */
        bottomInsetNudge: -10,
    },
} as const;

export const theme = {
    colors,
    spacing,
    components,
} as const;

/** Root screen background (use when NativeWind misses, e.g. SafeAreaView on web). */
export const screenFill = {
    flex: 1,
    backgroundColor: colors.background,
} as const;

/** Auth screens: scroll content fills small phones and keeps padding without relying on web className. */
export const authScrollContent = {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
} as const;
