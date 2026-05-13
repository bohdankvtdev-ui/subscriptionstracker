import { create } from "zustand";
import { ApiError, getApiBaseUrl } from "@/lib/api";
import { HOME_USER } from "@/domain/seed";
import { fetchAccount, patchAccount } from "./account.api";
import type { Account, AccountPatch } from "./account.types";

type TokenGetter = () => Promise<string | null>;

type AccountState = {
  account: Account;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: (hasApi: boolean) => void;
  loadAccount: (getToken: TokenGetter) => Promise<void>;
  updateAccount: (
    patch: AccountPatch,
    getToken: TokenGetter,
  ) => Promise<void>;
};

const nowSeconds = Math.floor(Date.now() / 1000);

export const DEFAULT_ACCOUNT: Account = {
  id: "local-account",
  email: null,
  displayName: HOME_USER.name,
  defaultCurrency: "USD",
  monthlyBudget: 0,
  availableBalance: 0,
  lowBalanceAlertEnabled: true,
  renewalReminderDays: 7,
  insightFocus: "balanced",
  completion: {
    hasDisplayName: true,
    hasBudget: false,
    hasBalance: false,
    missing: ["monthlyBudget", "availableBalance"],
  },
  createdAt: nowSeconds,
  updatedAt: nowSeconds,
};

function buildCompletion(account: Account): Account["completion"] {
  const hasDisplayName = Boolean(account.displayName?.trim());
  const hasBudget = account.monthlyBudget > 0;
  const hasBalance = account.availableBalance > 0;
  const missing: Account["completion"]["missing"] = [];

  if (!hasDisplayName) missing.push("displayName");
  if (!hasBudget) missing.push("monthlyBudget");
  if (!hasBalance) missing.push("availableBalance");

  return { hasDisplayName, hasBudget, hasBalance, missing };
}

function applyLocalPatch(account: Account, patch: AccountPatch): Account {
  const next = {
    ...account,
    ...patch,
    updatedAt: Math.floor(Date.now() / 1000),
  };

  return {
    ...next,
    completion: buildCompletion(next),
  };
}

function getAccountErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    return err.body ? `${err.message}: ${JSON.stringify(err.body)}` : err.message;
  }

  return err instanceof Error ? err.message : "Account request failed.";
}

export const useAccountStore = create<AccountState>((set, get) => ({
  account: DEFAULT_ACCOUNT,
  isLoading: false,
  isSaving: false,
  error: null,

  initialize: (hasApi) => {
    set({
      account: DEFAULT_ACCOUNT,
      isLoading: hasApi,
      error: null,
    });
  },

  loadAccount: async (getToken) => {
    set({ isLoading: true, error: null });

    try {
      const token = await getToken();
      const account = await fetchAccount(token);
      set({ account, isLoading: false });
    } catch (err) {
      console.warn("[account] GET /v1/account failed", err);
      set({ error: getAccountErrorMessage(err), isLoading: false });
    }
  },

  updateAccount: async (patch, getToken) => {
    const previous = get().account;
    const optimistic = applyLocalPatch(previous, patch);
    set({ account: optimistic, isSaving: true, error: null });

    try {
      if (getApiBaseUrl().length === 0) {
        set({ isSaving: false });
        return;
      }

      const token = await getToken();
      const account = await patchAccount(token, patch);
      set({ account, isSaving: false });
    } catch (err) {
      console.warn("[account] PATCH /v1/account failed", err);
      set({
        account: previous,
        error: getAccountErrorMessage(err),
        isSaving: false,
      });
      throw err;
    }
  },
}));
