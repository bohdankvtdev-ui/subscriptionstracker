import Ionicons from "@expo/vector-icons/Ionicons";

export type AppTab = {
  name: string;
  title: string;
};

export const tabs: AppTab[] = [
  { name: "index", title: "Home" },
  { name: "subscriptions", title: "Subscriptions" },
  { name: "insights", title: "Insights" },
  { name: "settings", title: "Settings" },
];

type IoniconName = keyof typeof Ionicons.glyphMap;

const idle: Record<string, IoniconName> = {
  index: "home-outline",
  subscriptions: "wallet-outline",
  insights: "bar-chart-outline",
  settings: "settings-outline",
};

const focused: Record<string, IoniconName> = {
  index: "home",
  subscriptions: "wallet",
  insights: "bar-chart",
  settings: "settings",
};

export function tabBarIoniconName(
  routeName: string,
  isFocused: boolean,
): IoniconName {
  const map = isFocused ? focused : idle;
  return map[routeName] ?? "ellipse-outline";
}
