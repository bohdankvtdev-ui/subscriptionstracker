import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/expo";
import type { Subscription } from "@/domain/subscription";
import { HOME_SUBSCRIPTIONS } from "@/domain/seed";
import CreateSubscriptionModal from "@/components/subscriptions/CreateSubscriptionModal";
import { ApiError, apiFetch, getApiBaseUrl } from "@/lib/api";
import {
  dtoToSubscription,
  inputToCreateBody,
  type CreateSubscriptionInput,
  type SubscriptionDTO,
} from "@/lib/subscriptions";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (input: CreateSubscriptionInput) => Promise<void>;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
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

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    hasApi ? [] : HOME_SUBSCRIPTIONS,
  );
  const [isLoading, setIsLoading] = useState<boolean>(hasApi);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  const loadFromServer = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await apiFetch(token, "/v1/subscriptions");
      const data = (await res.json()) as { subscriptions: SubscriptionDTO[] };
      setSubscriptions(data.subscriptions.map(dtoToSubscription));
    } catch (err) {
      console.warn("[subs] GET /v1/subscriptions failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load subscriptions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!hasApi) {
      setIsLoading(false);
      return;
    }
    if (!isSignedIn) {
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void loadFromServer();
  }, [hasApi, isSignedIn, loadFromServer]);

  const addSubscription = useCallback(
    async (input: CreateSubscriptionInput) => {
      setIsCreating(true);
      setError(null);
      try {
        if (!hasApi) {
          const body = inputToCreateBody(input);
          const now = new Date();
          const renewal = new Date(now);
          if (input.frequency === "Yearly") {
            renewal.setUTCFullYear(renewal.getUTCFullYear() + 1);
          } else {
            renewal.setUTCMonth(renewal.getUTCMonth() + 1);
          }
          const local = dtoToSubscription({
            id: `sub_local_${Date.now()}`,
            name: body.name,
            price: body.price,
            currency: body.currency,
            frequency: body.frequency,
            category: body.category,
            status: "active",
            icon: body.icon,
            color: body.color,
            startDate: now.toISOString(),
            renewalDate: renewal.toISOString(),
            billing: body.frequency,
          });
          setSubscriptions((prev) => [local, ...prev]);
          return;
        }

        const token = await getToken();
        const res = await apiFetch(token, "/v1/subscriptions", {
          method: "POST",
          body: JSON.stringify(inputToCreateBody(input)),
        });
        const data = (await res.json()) as { subscription: SubscriptionDTO };
        setSubscriptions((prev) => [
          dtoToSubscription(data.subscription),
          ...prev,
        ]);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.message}${
                err.body
                  ? `: ${
                      typeof err.body === "string"
                        ? err.body
                        : JSON.stringify(err.body)
                    }`
                  : ""
              }`
            : err instanceof Error
              ? err.message
              : "Failed to create subscription.";
        console.warn("[subs] POST /v1/subscriptions failed", err);
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [hasApi, getToken],
  );

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const value = useMemo<SubscriptionsContextValue>(
    () => ({
      subscriptions,
      addSubscription,
      isLoading,
      isCreating,
      error,
      isCreateOpen,
      openCreate,
      closeCreate,
    }),
    [
      subscriptions,
      addSubscription,
      isLoading,
      isCreating,
      error,
      isCreateOpen,
      openCreate,
      closeCreate,
    ],
  );

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
