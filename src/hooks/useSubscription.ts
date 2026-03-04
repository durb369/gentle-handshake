import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { isAndroid } from "@/lib/platform";
import { useRevenueCat } from "@/hooks/useRevenueCat";

// RevenueCat API key – set via VITE_REVENUECAT_ANDROID_KEY env var
const RC_API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined;

export interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionEnd: string | null;
  productId: string | null;
  loading: boolean;
}

/**
 * Unified subscription hook.
 * - On Android (Capacitor): delegates to RevenueCat / Google Play Billing.
 * - On Web: uses Stripe checkout via edge functions.
 */
export function useSubscription() {
  const onAndroid = useMemo(() => isAndroid(), []);

  // ---------- RevenueCat (Android) ----------
  const rc = useRevenueCat(onAndroid ? RC_API_KEY : undefined);

  // ---------- Stripe (Web) ----------
  const deviceId = useDeviceId();
  const [webStatus, setWebStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscriptionEnd: null,
    productId: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (onAndroid || !deviceId) return;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { deviceId },
      });
      if (error) {
        console.error("Error checking subscription:", error);
        setWebStatus((prev) => ({ ...prev, loading: false }));
        return;
      }
      setWebStatus({
        subscribed: data?.subscribed ?? false,
        subscriptionEnd: data?.subscription_end ?? null,
        productId: data?.product_id ?? null,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setWebStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [deviceId, onAndroid]);

  const startCheckout = useCallback(
    async (email?: string, priceId?: string) => {
      if (!deviceId) return null;
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { deviceId, email, priceId },
        });
        if (error) {
          console.error("Error creating checkout:", error);
          return null;
        }
        return data?.url ?? null;
      } catch (error) {
        console.error("Error creating checkout:", error);
        return null;
      }
    },
    [deviceId]
  );

  const openCustomerPortal = useCallback(async () => {
    if (!deviceId) return null;
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { deviceId },
      });
      if (error) {
        console.error("Error opening customer portal:", error);
        return null;
      }
      return data?.url ?? null;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      return null;
    }
  }, [deviceId]);

  // Auto-check on mount (web only)
  useEffect(() => {
    if (!onAndroid) checkSubscription();
  }, [checkSubscription, onAndroid]);

  // Checkout success detection (web only)
  useEffect(() => {
    if (onAndroid) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setTimeout(() => checkSubscription(), 2000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [checkSubscription, onAndroid]);

  // Periodic refresh (web only)
  useEffect(() => {
    if (onAndroid) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription, onAndroid]);

  // ---------- Unified return ----------
  if (onAndroid) {
    return {
      subscribed: rc.subscribed,
      subscriptionEnd: null as string | null,
      productId: rc.productId,
      loading: rc.loading,
      isBoosted: rc.isBoosted,
      isAndroid: true as const,
      // Android-specific
      purchaseProduct: rc.purchaseProduct,
      restorePurchases: rc.restorePurchases,
      RC_PRODUCT_IDS: rc.RC_PRODUCT_IDS,
      // Web stubs (unused on Android)
      checkSubscription: async () => {},
      startCheckout: async () => null as string | null,
      openCustomerPortal: async () => null as string | null,
    };
  }

  return {
    ...webStatus,
    isBoosted: webStatus.subscribed,
    isAndroid: false as const,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    // Android stubs (unused on web)
    purchaseProduct: async () => false,
    restorePurchases: async () => {},
    RC_PRODUCT_IDS: { boosted: "boosted_monthly", premium: "premium_monthly" },
  };
}
