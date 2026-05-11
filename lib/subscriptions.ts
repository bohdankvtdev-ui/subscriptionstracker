import { icons, type IconKey } from "@/constants/icons";
import {
  CATEGORY_COLORS,
  type Subscription,
  type SubscriptionCategory,
  type SubscriptionFrequency,
} from "@/domain/subscription";

const NAME_ICON_HINTS: { test: (name: string) => boolean; icon: IconKey }[] = [
  { test: (n) => /spotify/i.test(n), icon: "spotify" },
  { test: (n) => /notion/i.test(n), icon: "notion" },
  { test: (n) => /(openai|chatgpt|\bgpt\b)/i.test(n), icon: "openai" },
  { test: (n) => /claude/i.test(n), icon: "claude" },
  { test: (n) => /(github|copilot)/i.test(n), icon: "github" },
  { test: (n) => /figma/i.test(n), icon: "figma" },
  { test: (n) => /dropbox/i.test(n), icon: "dropbox" },
  { test: (n) => /adobe/i.test(n), icon: "adobe" },
  { test: (n) => /canva/i.test(n), icon: "canva" },
  { test: (n) => /medium/i.test(n), icon: "medium" },
  {
    test: (n) =>
      /(aws|azure|gcp|cloudflare|vercel|netlify|digitalocean|heroku)/i.test(n),
    icon: "activity",
  },
];

/** Best-effort icon from the subscription name (for defaults before user picks). */
export function suggestIconFromName(name: string): IconKey | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  for (const { test, icon } of NAME_ICON_HINTS) {
    if (test(trimmed)) return icon;
  }
  return null;
}

export type CreateSubscriptionInput = {
  name: string;
  price: number;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  /** When set, sent to the API and used for the list tile. */
  icon?: IconKey;
};

export type SubscriptionDTO = {
  id: string;
  name: string;
  price: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: string | null;
  status: string;
  icon: string | null;
  color: string | null;
  startDate: string;
  renewalDate: string;
  billing: SubscriptionFrequency;
};

const DEFAULT_ICON_KEY: IconKey = "wallet";

function resolveIcon(key: string | null): Subscription["icon"] {
  if (key && key in icons) {
    return icons[key as IconKey];
  }
  return icons[DEFAULT_ICON_KEY];
}

export function dtoToSubscription(dto: SubscriptionDTO): Subscription {
  const category = (dto.category as SubscriptionCategory | null) ?? undefined;
  return {
    id: dto.id,
    icon: resolveIcon(dto.icon),
    name: dto.name,
    price: dto.price,
    currency: dto.currency,
    status: dto.status,
    category: category ?? undefined,
    billing: dto.billing ?? dto.frequency,
    startDate: dto.startDate,
    renewalDate: dto.renewalDate,
    color:
      dto.color ??
      (category ? CATEGORY_COLORS[category] : undefined) ??
      CATEGORY_COLORS.Other,
  };
}

export function inputToCreateBody(input: CreateSubscriptionInput) {
  const icon =
    input.icon ?? suggestIconFromName(input.name) ?? DEFAULT_ICON_KEY;
  return {
    name: input.name.trim(),
    price: input.price,
    currency: "USD",
    frequency: input.frequency,
    category: input.category,
    icon,
    color: CATEGORY_COLORS[input.category] ?? CATEGORY_COLORS.Other,
  };
}
