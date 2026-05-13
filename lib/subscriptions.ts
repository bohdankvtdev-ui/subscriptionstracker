import {
  getIconImageSource,
  isSubscriptionIconKey,
  type IconKey,
} from "@/constants/icons";
import {
  CATEGORY_COLORS,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
  type Subscription,
  type SubscriptionCategory,
  type SubscriptionFrequency,
  type SubscriptionStatus,
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
    icon: "cloud",
  },
  { test: (n) => /(netflix)/i.test(n), icon: "netflix" },
  { test: (n) => /(youtube|yt premium)/i.test(n), icon: "youtube" },
  { test: (n) => /(icloud|apple)/i.test(n), icon: "icloud" },
  { test: (n) => /(slack)/i.test(n), icon: "slack" },
  { test: (n) => /(zoom)/i.test(n), icon: "zoom" },
  { test: (n) => /(vpn|nord|surfshark)/i.test(n), icon: "vpn" },
  { test: (n) => /(1password|bitwarden|password)/i.test(n), icon: "password" },
  { test: (n) => /(fitness|gym|strava)/i.test(n), icon: "fitness" },
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
  currency?: string;
  /** When set, sent to the API and used for the list tile. */
  icon?: IconKey;
  /**
   * Next billing date (ISO 8601, typically noon UTC from YYYY-MM-DD).
   * When omitted, the server uses “now” for the first renewal window.
   */
  nextRenewalDate?: string;
};

/** Parse optional `YYYY-MM-DD` from the create form into a stable UTC anchor. */
export function parseNextRenewalDateInput(
  trimmed: string,
):
  | { ok: true; iso: string }
  | { ok: false; reason: string } {
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    return { ok: false, reason: "Use format YYYY-MM-DD." };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (!Number.isInteger(y) || y < 1970 || y > 2100) {
    return { ok: false, reason: "Enter a realistic year." };
  }
  if (!Number.isInteger(mo) || mo < 1 || mo > 12) {
    return { ok: false, reason: "Month must be 01–12." };
  }
  if (!Number.isInteger(da) || da < 1 || da > 31) {
    return { ok: false, reason: "Day must be 01–31." };
  }
  const noon = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
  if (
    noon.getUTCFullYear() !== y ||
    noon.getUTCMonth() !== mo - 1 ||
    noon.getUTCDate() !== da
  ) {
    return { ok: false, reason: "That calendar date is not valid." };
  }
  return { ok: true, iso: noon.toISOString() };
}

export type UpdateSubscriptionInput = Partial<{
  name: string;
  price: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  icon: IconKey;
  color: string;
  status: SubscriptionStatus;
}>;

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
const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"] as const;

function resolveIcon(key: string | null): Subscription["icon"] {
  return getIconImageSource(key);
}

function normalizeIconKey(key: string | null | undefined): IconKey {
  return isSubscriptionIconKey(key) ? key : DEFAULT_ICON_KEY;
}

function normalizeFrequency(value: string | null | undefined): SubscriptionFrequency {
  return SUBSCRIPTION_FREQUENCIES.includes(value as SubscriptionFrequency)
    ? (value as SubscriptionFrequency)
    : "Monthly";
}

function normalizeCategory(
  value: string | null | undefined,
): SubscriptionCategory | undefined {
  return SUBSCRIPTION_CATEGORIES.includes(value as SubscriptionCategory)
    ? (value as SubscriptionCategory)
    : undefined;
}

function normalizeStatus(value: string | null | undefined): SubscriptionStatus {
  return SUBSCRIPTION_STATUSES.includes(value as SubscriptionStatus)
    ? (value as SubscriptionStatus)
    : "active";
}

export function dtoToSubscription(dto: SubscriptionDTO): Subscription {
  const category = normalizeCategory(dto.category);
  const billing = normalizeFrequency(dto.billing ?? dto.frequency);
  return {
    id: dto.id,
    icon: resolveIcon(dto.icon),
    iconKey: normalizeIconKey(dto.icon),
    name: dto.name,
    price: dto.price,
    currency: dto.currency,
    status: normalizeStatus(dto.status),
    category: category ?? undefined,
    billing,
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
  const base = {
    name: input.name.trim(),
    price: input.price,
    currency: input.currency ?? "USD",
    frequency: input.frequency,
    category: input.category,
    icon,
    color: CATEGORY_COLORS[input.category] ?? CATEGORY_COLORS.Other,
  };
  if (input.nextRenewalDate) {
    return { ...base, renewalDate: input.nextRenewalDate };
  }
  return base;
}

export function inputToUpdateBody(input: UpdateSubscriptionInput) {
  return {
    ...input,
    name: input.name?.trim(),
  };
}
