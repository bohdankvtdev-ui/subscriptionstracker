import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import clsx from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
  CATEGORY_COLORS,
  type SubscriptionCategory,
  type SubscriptionFrequency,
} from "@/domain/subscription";
import { icons, SUBSCRIPTION_PICKER_ICONS, type IconKey } from "@/constants/icons";
import {
  suggestIconFromName,
  type CreateSubscriptionInput,
} from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/format";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: CreateSubscriptionInput) => Promise<void>;
  isSubmitting?: boolean;
};

const DEFAULT_FREQUENCY: SubscriptionFrequency = "Monthly";
const DEFAULT_CATEGORY: SubscriptionCategory = "Other";
const DEFAULT_ICON: IconKey = "wallet";

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
  const [iconLockedByUser, setIconLockedByUser] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trimmedName = name.trim();
  const parsedPrice = useMemo(() => {
    const n = parseFloat(price.replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [price]);

  const nameError =
    submitted && trimmedName.length === 0
      ? "Give it a name."
      : null;
  const priceError =
    submitted && parsedPrice === null
      ? "Enter an amount greater than zero."
      : null;

  const isValid = trimmedName.length > 0 && parsedPrice !== null;

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
    setIconLockedByUser(false);
    setSubmitted(false);
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

  const previewTitle = trimmedName.length > 0 ? trimmedName : "Your subscription";
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
              <Pressable
                className="create-close"
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={handleClose}
                hitSlop={8}
              >
                <Text className="create-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 4,
                paddingBottom: 24 + Math.max(insets.bottom, 12),
                gap: 24,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="create-preview">
                <View
                  className="create-preview-icon-wrap"
                  style={{ backgroundColor: accent }}
                >
                  <Image source={icons[iconKey]} className="create-preview-icon" />
                </View>
                <View className="create-preview-copy">
                  <Text numberOfLines={1} className="create-preview-title">
                    {previewTitle}
                  </Text>
                  <Text numberOfLines={1} className="create-preview-meta">
                    {previewPriceText}
                  </Text>
                  <View className="create-preview-tag-row">
                    <View
                      className="create-preview-dot"
                      style={{ backgroundColor: accent }}
                    />
                    <Text className="create-preview-tag">{category}</Text>
                  </View>
                </View>
              </View>

              <View className="create-field">
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
              </View>

              <View className="create-field">
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
              </View>

              <View className="create-field">
                <Text className="create-label">Billing cycle</Text>
                <View className="create-segment">
                  {SUBSCRIPTION_FREQUENCIES.map((f) => {
                    const active = f === frequency;
                    return (
                      <Pressable
                        key={f}
                        className={clsx(
                          "create-segment-pill",
                          active && "create-segment-pill-active",
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => pickFrequency(f)}
                      >
                        <Text
                          className={clsx(
                            "create-segment-text",
                            active && "create-segment-text-active",
                          )}
                        >
                          {f}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="create-field">
                <Text className="create-label">Category</Text>
                <View className="create-chips">
                  {SUBSCRIPTION_CATEGORIES.map((c) => {
                    const active = c === category;
                    return (
                      <Pressable
                        key={c}
                        className={clsx(
                          "create-chip",
                          active && "create-chip-active",
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => pickCategory(c)}
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
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="create-field">
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
                    <Text className="create-label-hint">Auto from name</Text>
                  )}
                </View>
                <View className="create-icon-grid">
                  {SUBSCRIPTION_PICKER_ICONS.map((key) => {
                    const active = key === iconKey;
                    return (
                      <Pressable
                        key={key}
                        className={clsx(
                          "create-icon-cell",
                          active && "create-icon-cell-active",
                        )}
                        accessibilityRole="button"
                        accessibilityLabel={`Icon ${key}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => pickIcon(key)}
                      >
                        <Image
                          source={icons[key]}
                          className="create-icon-thumb"
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                className={clsx(
                  "create-submit",
                  (!isValid || isSubmitting) && "create-submit-disabled",
                )}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isValid || isSubmitting }}
                disabled={!isValid || isSubmitting}
                onPress={handleSubmit}
              >
                <Text className="create-submit-text">
                  {isSubmitting ? "Saving…" : "Save subscription"}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
