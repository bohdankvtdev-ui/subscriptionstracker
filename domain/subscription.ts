import type { ImageSourcePropType } from "react-native";

export type SubscriptionFrequency = "Monthly" | "Yearly";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export const SUBSCRIPTION_FREQUENCIES = ["Monthly", "Yearly"] as const;

export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Entertainment: "#fbbf77",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#bae6fd",
  Cloud: "#6ee7b7",
  Music: "#a7f3d0",
  Other: "#e8e4dc",
};

export type Subscription = {
  id: string;
  icon: ImageSourcePropType;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  price: number;
  currency?: string;
  billing: string;
  renewalDate?: string;
  color?: string;
};

export type SubscriptionCardProps = Omit<Subscription, "id"> & {
  expanded: boolean;
  onPress: () => void;
  onCancelPress?: () => void;
  isCancelling?: boolean;
};

export type UpcomingSubscription = {
  id: string;
  icon: ImageSourcePropType;
  name: string;
  price: number;
  currency?: string;
  daysLeft: number;
};

export type UpcomingSubscriptionCardProps = Omit<UpcomingSubscription, "id">;
