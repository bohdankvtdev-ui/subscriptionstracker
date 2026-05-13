import { create } from "zustand";
import type { Subscription } from "@/domain/subscription";
import { HOME_SUBSCRIPTIONS } from "@/domain/seed";
import { getIconImageSource } from "@/constants/icons";
import { ApiError, apiFetch, getApiBaseUrl } from "@/lib/api";
import {
  dtoToSubscription,
  inputToCreateBody,
  inputToUpdateBody,
  type CreateSubscriptionInput,
  type SubscriptionDTO,
  type UpdateSubscriptionInput,
} from "@/lib/subscriptions";

type TokenGetter = () => Promise<string | null>;

type SubscriptionsState = {
  subscriptions: Subscription[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  isCreateOpen: boolean;
  initialize: (hasApi: boolean) => void;
  loadSubscriptions: (getToken: TokenGetter) => Promise<void>;
  addSubscription: (
    input: CreateSubscriptionInput,
    getToken: TokenGetter,
  ) => Promise<void>;
  updateSubscription: (
    id: string,
    input: UpdateSubscriptionInput,
    getToken: TokenGetter,
  ) => Promise<void>;
  deleteSubscription: (id: string, getToken: TokenGetter) => Promise<void>;
  openCreate: () => void;
  closeCreate: () => void;
};

function buildLocalSubscription(input: CreateSubscriptionInput): Subscription {
  const body = inputToCreateBody(input);
  const now = new Date();
  let startDate: string;
  let renewalDate: string;

  if (input.nextRenewalDate) {
    renewalDate = input.nextRenewalDate;
    const anchor = new Date(renewalDate);
    const start = new Date(anchor);
    if (input.frequency === "Yearly") {
      start.setUTCFullYear(start.getUTCFullYear() - 1);
    } else {
      start.setUTCMonth(start.getUTCMonth() - 1);
    }
    startDate = start.toISOString();
  } else {
    const renewal = new Date(now);
    if (input.frequency === "Yearly") {
      renewal.setUTCFullYear(renewal.getUTCFullYear() + 1);
    } else {
      renewal.setUTCMonth(renewal.getUTCMonth() + 1);
    }
    startDate = now.toISOString();
    renewalDate = renewal.toISOString();
  }

  return dtoToSubscription({
    id: `sub_local_${Date.now()}`,
    name: body.name,
    price: body.price,
    currency: body.currency,
    frequency: body.frequency,
    category: body.category,
    status: "active",
    icon: body.icon,
    color: body.color,
    startDate,
    renewalDate,
    billing: body.frequency,
  });
}

function getCreateErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    const body =
      err.body == null
        ? ""
        : `: ${typeof err.body === "string" ? err.body : JSON.stringify(err.body)}`;
    return `${err.message}${body}`;
  }

  return err instanceof Error ? err.message : "Failed to create subscription.";
}

function applyLocalUpdate(
  subscription: Subscription,
  input: UpdateSubscriptionInput,
): Subscription {
  return {
    ...subscription,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.frequency !== undefined ? { billing: input.frequency } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.color !== undefined ? { color: input.color } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.icon !== undefined
      ? { icon: getIconImageSource(input.icon), iconKey: input.icon }
      : {}),
  };
}

export const useSubscriptionsStore = create<SubscriptionsState>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  isLoading: false,
  isCreating: false,
  error: null,
  isCreateOpen: false,

  initialize: (hasApi) => {
    set({
      subscriptions: hasApi ? [] : HOME_SUBSCRIPTIONS,
      isLoading: hasApi,
      error: null,
    });
  },

  loadSubscriptions: async (getToken) => {
    set({ error: null, isLoading: true });

    try {
      const token = await getToken();
      const res = await apiFetch(token, "/v1/subscriptions");
      const data = (await res.json()) as { subscriptions: SubscriptionDTO[] };
      set({
        subscriptions: data.subscriptions.map(dtoToSubscription),
        isLoading: false,
      });
    } catch (err) {
      console.warn("[subs] GET /v1/subscriptions failed", err);
      set({
        error:
          err instanceof Error ? err.message : "Failed to load subscriptions.",
        isLoading: false,
      });
    }
  },

  addSubscription: async (input, getToken) => {
    set({ error: null, isCreating: true });

    try {
      if (getApiBaseUrl().length === 0) {
        const local = buildLocalSubscription(input);
        set((state) => ({
          subscriptions: [local, ...state.subscriptions],
          isCreating: false,
        }));
        return;
      }

      const token = await getToken();
      const res = await apiFetch(token, "/v1/subscriptions", {
        method: "POST",
        body: JSON.stringify(inputToCreateBody(input)),
      });
      const data = (await res.json()) as { subscription: SubscriptionDTO };
      set((state) => ({
        subscriptions: [dtoToSubscription(data.subscription), ...state.subscriptions],
        isCreating: false,
      }));
    } catch (err) {
      const message = getCreateErrorMessage(err);
      console.warn("[subs] POST /v1/subscriptions failed", err);
      set({ error: message, isCreating: false });
      throw err;
    }
  },

  updateSubscription: async (id, input, getToken) => {
    set({ error: null });

    try {
      if (getApiBaseUrl().length === 0) {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === id
              ? applyLocalUpdate(subscription, input)
              : subscription,
          ),
        }));
        return;
      }

      const token = await getToken();
      const res = await apiFetch(token, `/v1/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(inputToUpdateBody(input)),
      });
      const data = (await res.json()) as { subscription: SubscriptionDTO };
      set((state) => ({
        subscriptions: state.subscriptions.map((subscription) =>
          subscription.id === id
            ? dtoToSubscription(data.subscription)
            : subscription,
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update subscription.";
      console.warn("[subs] PATCH /v1/subscriptions failed", err);
      set({ error: message });
      throw err;
    }
  },

  deleteSubscription: async (id, getToken) => {
    set({ error: null });

    try {
      if (getApiBaseUrl().length === 0) {
        set((state) => ({
          subscriptions: state.subscriptions.filter(
            (subscription) => subscription.id !== id,
          ),
        }));
        return;
      }

      const token = await getToken();
      await apiFetch(token, `/v1/subscriptions/${id}`, { method: "DELETE" });
      set((state) => ({
        subscriptions: state.subscriptions.filter(
          (subscription) => subscription.id !== id,
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete subscription.";
      console.warn("[subs] DELETE /v1/subscriptions failed", err);
      set({ error: message });
      throw err;
    }
  },

  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),
}));
