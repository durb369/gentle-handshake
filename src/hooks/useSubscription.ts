import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionEnd: string | null;
  productId: string | null;
  loading: boolean;
}

export function useSubscription() {
  const deviceId = useDeviceId();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscriptionEnd: null,
    productId: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!deviceId) return;

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { deviceId },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      setStatus({
        subscribed: data?.subscribed ?? false,
        subscriptionEnd: data?.subscription_end ?? null,
        productId: data?.product_id ?? null,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, [deviceId]);

  const startCheckout = useCallback(async (email?: string, priceId?: string) => {
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
  }, [deviceId]);

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

  // Check subscription on mount and when deviceId changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check for checkout success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      // Re-check subscription after successful checkout
      setTimeout(() => {
        checkSubscription();
      }, 2000);
      
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return {
    ...status,
    isBoosted: status.subscribed,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
  };
}
