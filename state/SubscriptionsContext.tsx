import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/expo";
import type { Subscription } from "@/domain/subscription";
import CreateSubscriptionModal from "@/components/subscriptions/CreateSubscriptionModal";
import { getApiBaseUrl } from "@/lib/api";
import {
  type CreateSubscriptionInput,
  type UpdateSubscriptionInput,
} from "@/lib/subscriptions";
import type { Account, AccountPatch } from "@/src/features/account/account.types";
import { useAccountStore } from "@/src/features/account/account.store";
import { useSubscriptionsStore } from "@/src/features/subscriptions/subscriptions.store";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  account: Account;
  addSubscription: (input: CreateSubscriptionInput) => Promise<void>;
  updateSubscription: (
    id: string,
    input: UpdateSubscriptionInput,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateAccount: (input: AccountPatch) => Promise<void>;
  isLoading: boolean;
  isAccountLoading: boolean;
  isCreating: boolean;
  isAccountSaving: boolean;
  error: string | null;
  accountError: string | null;
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const hasApi = getApiBaseUrl().length > 0;

  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const account = useAccountStore((state) => state.account);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const isAccountLoading = useAccountStore((state) => state.isLoading);
  const isCreating = useSubscriptionsStore((state) => state.isCreating);
  const isAccountSaving = useAccountStore((state) => state.isSaving);
  const error = useSubscriptionsStore((state) => state.error);
  const accountError = useAccountStore((state) => state.error);
  const isCreateOpen = useSubscriptionsStore((state) => state.isCreateOpen);
  const initializeAccount = useAccountStore((state) => state.initialize);
  const loadAccount = useAccountStore((state) => state.loadAccount);
  const updateAccountInStore = useAccountStore((state) => state.updateAccount);
  const initialize = useSubscriptionsStore((state) => state.initialize);
  const loadSubscriptions = useSubscriptionsStore(
    (state) => state.loadSubscriptions,
  );
  const addSubscriptionToStore = useSubscriptionsStore(
    (state) => state.addSubscription,
  );
  const updateSubscriptionInStore = useSubscriptionsStore(
    (state) => state.updateSubscription,
  );
  const deleteSubscriptionInStore = useSubscriptionsStore(
    (state) => state.deleteSubscription,
  );
  const openCreate = useSubscriptionsStore((state) => state.openCreate);
  const closeCreate = useSubscriptionsStore((state) => state.closeCreate);

  const hasInitializedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      initialize(hasApi);
      initializeAccount(hasApi);
      hasInitializedRef.current = true;
    }

    if (!hasApi) {
      return;
    }
    if (!isSignedIn) {
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void loadAccount(getToken);
    void loadSubscriptions(getToken);
  }, [
    getToken,
    hasApi,
    initialize,
    initializeAccount,
    isSignedIn,
    loadAccount,
    loadSubscriptions,
  ]);

  const addSubscription = useCallback(
    (input: CreateSubscriptionInput) =>
      addSubscriptionToStore(
        { currency: account.defaultCurrency, ...input },
        getToken,
      ),
    [account.defaultCurrency, addSubscriptionToStore, getToken],
  );

  const updateSubscription = useCallback(
    (id: string, input: UpdateSubscriptionInput) =>
      updateSubscriptionInStore(id, input, getToken),
    [getToken, updateSubscriptionInStore],
  );

  const deleteSubscription = useCallback(
    (id: string) => deleteSubscriptionInStore(id, getToken),
    [deleteSubscriptionInStore, getToken],
  );

  const updateAccount = useCallback(
    (input: AccountPatch) => updateAccountInStore(input, getToken),
    [getToken, updateAccountInStore],
  );

  const value: SubscriptionsContextValue = {
    subscriptions,
    account,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateAccount,
    isLoading,
    isAccountLoading,
    isCreating,
    isAccountSaving,
    error,
    accountError,
    isCreateOpen,
    openCreate,
    closeCreate,
  };

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
      <CreateSubscriptionModal
        visible={isCreateOpen}
        onClose={closeCreate}
        onCreate={addSubscription}
        isSubmitting={isCreating}
      />
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptionsCtx(): SubscriptionsContextValue {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error(
      "useSubscriptionsCtx must be used inside <SubscriptionsProvider>.",
    );
  }
  return ctx;
}
