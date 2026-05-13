import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { clsx } from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enterDown } from "@/constants/motion";
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
  CATEGORY_COLORS,
  type SubscriptionCategory,
  type SubscriptionFrequency,
} from "@/domain/subscription";
import {
  getIconBackgroundColor,
  getIconColor,
  getIconLabel,
  searchSubscriptionIcons,
  SUBSCRIPTION_ICON_SEARCH_HINTS,
  type IconKey,
} from "@/constants/icons";
import {
  suggestIconFromName,
  type CreateSubscriptionInput,
  parseNextRenewalDateInput,
} from "@/lib/subscriptions";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/format";
import { Press3D } from "@/components/ui/Press3D";
import { colors, neo } from "@/constants/theme";
import { SubscriptionIcon } from "@/components/subscriptions/SubscriptionIcon";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: CreateSubscriptionInput) => Promise<void>;
  isSubmitting?: boolean;
};

const DEFAULT_FREQUENCY: SubscriptionFrequency = "Monthly";
const DEFAULT_CATEGORY: SubscriptionCategory = "Other";
const DEFAULT_ICON: IconKey = "wallet";
const DEFAULT_VISIBLE_ICONS = 16;

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
  isSubmitting,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] =
    useState<SubscriptionFrequency>(DEFAULT_FREQUENCY);
  const [category, setCategory] =
    useState<SubscriptionCategory>(DEFAULT_CATEGORY);
  const [iconKey, setIconKey] = useState<IconKey>(DEFAULT_ICON);
  const [iconSearch, setIconSearch] = useState("");
  const [iconLockedByUser, setIconLockedByUser] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [renewalDateStr, setRenewalDateStr] = useState("");

  const renewalTrimmed = renewalDateStr.trim();
  const renewalParsed = useMemo(() => {
    if (!renewalTrimmed) return null;
    return parseNextRenewalDateInput(renewalTrimmed);
  }, [renewalTrimmed]);

  const renewalDateError =
    submitted && renewalTrimmed.length > 0 && renewalParsed && !renewalParsed.ok
      ? renewalParsed.reason
      : null;

  const trimmedName = name.trim();
  const parsedPrice = useMemo(() => {
    const n = parseFloat(price.replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [price]);

  const nameError =
    submitted && trimmedName.length === 0 ? "Give it a name." : null;
  const priceError =
    submitted && parsedPrice === null
      ? "Enter an amount greater than zero."
      : null;

  const isValid =
    trimmedName.length > 0 &&
    parsedPrice !== null &&
    (renewalTrimmed.length === 0 ||
      (renewalParsed !== null && renewalParsed.ok));
  const filteredIconOptions = useMemo(
    () => searchSubscriptionIcons(iconSearch),
    [iconSearch],
  );
  const visibleIconOptions = useMemo(
    () =>
      iconSearch.trim().length > 0
        ? filteredIconOptions
        : filteredIconOptions.slice(0, DEFAULT_VISIBLE_ICONS),
    [filteredIconOptions, iconSearch],
  );

  useEffect(() => {
    if (iconLockedByUser) return;
    const suggested = suggestIconFromName(name);
    setIconKey(suggested ?? DEFAULT_ICON);
  }, [name, iconLockedByUser]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency(DEFAULT_FREQUENCY);
    setCategory(DEFAULT_CATEGORY);
    setIconKey(DEFAULT_ICON);
    setIconSearch("");
    setIconLockedByUser(false);
    setSubmitted(false);
    setRenewalDateStr("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValid || parsedPrice === null || isSubmitting) return;

    try {
      await onCreate({
        name: trimmedName,
        price: parsedPrice,
        frequency,
        category,
        icon: iconKey,
        ...(renewalParsed && renewalParsed.ok
          ? { nextRenewalDate: renewalParsed.iso }
          : {}),
      });
      resetForm();
      onClose();
    } catch {
      // Context surfaces error; keep modal open for retry.
    }
  };

  const pickIcon = (key: IconKey) => {
    void Haptics.selectionAsync();
    setIconKey(key);
    setIconLockedByUser(true);
  };

  const pickCategory = (c: SubscriptionCategory) => {
    void Haptics.selectionAsync();
    setCategory(c);
  };

  const pickFrequency = (f: SubscriptionFrequency) => {
    void Haptics.selectionAsync();
    setFrequency(f);
  };

  const previewTitle =
    trimmedName.length > 0 ? trimmedName : "Your subscription";
  const previewRenewalLine =
    renewalParsed && renewalParsed.ok
      ? `Next renewal · ${formatSubscriptionDateTime(renewalParsed.iso)}`
      : null;
  const previewPriceText =
    parsedPrice !== null
      ? `${formatCurrency(parsedPrice, "USD")} · ${
          frequency === "Yearly" ? "per year" : "per month"
        }`
      : `— · ${frequency === "Yearly" ? "per year" : "per month"}`;
  const accent = CATEGORY_COLORS[category];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className="modal-overlay"
          accessibilityLabel="Dismiss modal"
          onPress={handleClose}
        >
          <Pressable
            className="create-sheet"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="create-handle" accessibilityElementsHidden />

            <View className="create-header">
              <Text className="create-title">New subscription</Text>
              <Press3D
                accessibilityLabel="Close"
                onPress={handleClose}
                offset={neo.offsetXs}
                radius={999}
                shadowColor={neo.shadowColor}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.muted,
                  borderWidth: neo.borderLight,
                  borderColor: colors.border,
                }}
              >
                <Text className="create-close-text">×</Text>
              </Press3D>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 4,
                paddingBottom: 24 + Math.max(insets.bottom, 12),
                gap: 16,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                entering={enterDown}
              >
                <Press3D
                  offset={neo.offsetSm}
                  radius={20}
                  shadowColor={neo.shadowColor}
                  accessibilityRole="header"
                  accessibilityLabel="Subscription preview"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: neo.border,
                    borderColor: colors.border,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      borderWidth: neo.border,
                      borderColor: colors.border,
                      backgroundColor: getIconBackgroundColor(iconKey),
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Animated.View
                      key={iconKey}
                      entering={ZoomIn.duration(180)}
                    >
                      <SubscriptionIcon
                        iconKey={iconKey}
                        size={34}
                        color={getIconColor(iconKey)}
                      />
                    </Animated.View>
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text numberOfLines={1} className="create-preview-title">
                      {previewTitle}
                    </Text>
                    <Text numberOfLines={1} className="create-preview-meta">
                      {previewPriceText}
                    </Text>
                    {previewRenewalLine ? (
                      <Text
                        numberOfLines={1}
                        className="text-xs font-sans-semibold text-muted-foreground"
                      >
                        {previewRenewalLine}
                      </Text>
                    ) : null}
                    <View className="create-preview-tag-row">
                      <View
                        className="create-preview-dot"
                        style={{ backgroundColor: accent }}
                      />
                      <Text className="create-preview-tag">{category}</Text>
                    </View>
                  </View>
                </Press3D>
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(80).duration(240)}
                className="create-field"
              >
                <Text className="create-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Spotify, Notion, iCloud…"
                  placeholderTextColor="#9b9690"
                  className={clsx(
                    "create-input",
                    nameError && "create-input-error",
                  )}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                {nameError ? (
                  <Text className="create-error">{nameError}</Text>
                ) : null}
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(120).duration(240)}
                className="create-field"
              >
                <Text className="create-label">Amount</Text>
                <View
                  className={clsx(
                    "create-price",
                    priceError && "create-price-error",
                  )}
                >
                  <Text className="create-price-prefix">$</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#9b9690"
                    keyboardType="decimal-pad"
                    className="create-price-input"
                    returnKeyType="done"
                  />
                  <Text className="create-price-suffix">USD</Text>
                </View>
                {priceError ? (
                  <Text className="create-error">{priceError}</Text>
                ) : null}
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(160).duration(240)}
                className="create-field"
              >
                <Text className="create-label">Billing</Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  {SUBSCRIPTION_FREQUENCIES.map((f) => {
                    const active = f === frequency;
                    return (
                      <Press3D
                        key={f}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        active={active}
                        onPress={() => pickFrequency(f)}
                        offset={neo.offsetXs}
                        radius={14}
                        shadowColor={neo.shadowColor}
                        containerStyle={{ flex: 1 }}
                        style={{
                          backgroundColor: active ? colors.secondary : colors.card,
                          borderWidth: neo.border,
                          borderColor: colors.border,
                          paddingVertical: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          className={clsx(
                            "create-segment-text",
                            active && "create-segment-text-active",
                          )}
                        >
                          {f}
                        </Text>
                      </Press3D>
                    );
                  })}
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(180).duration(240)}
                className="create-field"
              >
                <Text className="create-label">Next renewal (optional)</Text>
                <TextInput
                  value={renewalDateStr}
                  onChangeText={setRenewalDateStr}
                  placeholder="YYYY-MM-DD — leave empty for default"
                  placeholderTextColor="#9b9690"
                  className={clsx(
                    "create-input",
                    renewalDateError && "create-input-error",
                  )}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                />
                {renewalDateError ? (
                  <Text className="create-error">{renewalDateError}</Text>
                ) : (
                  <Text className="text-xs font-sans-semibold leading-4 text-muted-foreground">
                    Matches Upcoming and insights. Leave blank to use the next billing
                    period from today.
                  </Text>
                )}
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(200).duration(240)}
                className="create-field"
              >
                <Text className="create-label">Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={{ flexDirection: "row", gap: 10, paddingBottom: 4 }}>
                    {SUBSCRIPTION_CATEGORIES.map((c) => {
                      const active = c === category;
                      return (
                        <Press3D
                          key={c}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          active={active}
                          onPress={() => pickCategory(c)}
                          offset={neo.offsetXs}
                          radius={999}
                          shadowColor={neo.shadowColor}
                          style={{
                            backgroundColor: active ? colors.secondary : colors.card,
                            borderWidth: neo.borderLight,
                            borderColor: colors.border,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <View
                            className="create-chip-dot"
                            style={{ backgroundColor: CATEGORY_COLORS[c] }}
                          />
                          <Text
                            className={clsx(
                              "create-chip-text",
                              active && "create-chip-text-active",
                            )}
                          >
                            {c}
                          </Text>
                        </Press3D>
                      );
                    })}
                  </View>
                </ScrollView>
              </Animated.View>

              <Animated.View
                entering={FadeIn.delay(240).duration(240)}
                className="create-field"
              >
                <View className="create-label-row">
                  <Text className="create-label">Icon</Text>
                  {iconLockedByUser ? (
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setIconLockedByUser(false);
                        const suggested = suggestIconFromName(name);
                        setIconKey(suggested ?? DEFAULT_ICON);
                      }}
                      accessibilityRole="button"
                      hitSlop={8}
                    >
                      <Text className="create-label-action">Auto</Text>
                    </Pressable>
                  ) : (
                    <Text className="create-label-hint">
                      {getIconLabel(iconKey)}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    borderWidth: neo.borderLight,
                    borderColor: colors.border,
                    borderRadius: 14,
                    backgroundColor: colors.card,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 10,
                  }}
                >
                  <TextInput
                    value={iconSearch}
                    onChangeText={setIconSearch}
                    placeholder={`Search: ${SUBSCRIPTION_ICON_SEARCH_HINTS.join(", ")}`}
                    placeholderTextColor="#9b9690"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      color: colors.foreground,
                      fontFamily: "Montserrat_600SemiBold",
                      fontSize: 14,
                      padding: 0,
                    }}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={{ flexDirection: "row", gap: 10, paddingBottom: 4 }}>
                    {visibleIconOptions.map((option) => {
                      const active = option.key === iconKey;
                      const iconColor = getIconColor(option.key);
                      const iconBackground = getIconBackgroundColor(option.key);
                      return (
                        <Press3D
                          key={option.key}
                          accessibilityRole="button"
                          accessibilityLabel={`Icon ${option.label}`}
                          accessibilityState={{ selected: active }}
                          active={active}
                          onPress={() => pickIcon(option.key as IconKey)}
                          offset={neo.offsetXs}
                          radius={14}
                          shadowColor={neo.shadowColor}
                          style={{
                            width: 56,
                            height: 58,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: iconBackground,
                            borderWidth: neo.borderLight,
                            borderColor: active ? iconColor : colors.border,
                            opacity: active ? 1 : 0.96,
                          }}
                        >
                          <SubscriptionIcon
                            iconKey={option.key}
                            size={34}
                            color={iconColor}
                          />
                        </Press3D>
                      );
                    })}
                  </View>
                </ScrollView>
                {filteredIconOptions.length === 0 ? (
                  <Text className="create-label-hint">
                    No icons found. Try “cloud”, “music”, “design”, or “bank”.
                  </Text>
                ) : iconSearch.trim().length === 0 &&
                  filteredIconOptions.length > DEFAULT_VISIBLE_ICONS ? (
                  <Text className="create-label-hint">
                    Search to reveal {filteredIconOptions.length - DEFAULT_VISIBLE_ICONS} more icons.
                  </Text>
                ) : null}
              </Animated.View>

              <Animated.View entering={FadeIn.delay(280).duration(240)}>
                <Press3D
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !isValid || isSubmitting }}
                  disabled={!isValid || isSubmitting}
                  onPress={handleSubmit}
                  offset={neo.offsetSm}
                  radius={18}
                  shadowColor={neo.shadowColor}
                  style={{
                    backgroundColor:
                      !isValid || isSubmitting ? "#6ee7b7" : colors.primary,
                    borderWidth: neo.border,
                    borderColor: colors.border,
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: !isValid || isSubmitting ? 0.7 : 1,
                  }}
                >
                  <Text
                    style={{
                      color:
                        !isValid || isSubmitting
                          ? colors.foreground
                          : colors.primaryForeground,
                      fontFamily: "Montserrat_700Bold",
                      fontSize: 16,
                    }}
                  >
                    {isSubmitting ? "Saving…" : "Save subscription"}
                  </Text>
                </Press3D>
              </Animated.View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
