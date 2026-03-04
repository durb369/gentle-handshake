import { useState, useEffect, useCallback } from "react";
import { isAndroid } from "@/lib/platform";

// RevenueCat product identifiers (must match Play Console products)
const RC_PRODUCT_IDS = {
  boosted: "boosted_monthly",
  premium: "premium_monthly",
};

// RevenueCat entitlement identifiers
const RC_ENTITLEMENTS = {
  boosted: "boosted",
  premium: "premium",
};

interface RevenueCatStatus {
  subscribed: boolean;
  productId: string | null;
  loading: boolean;
}

/**
 * Hook for RevenueCat in-app purchases on Android.
 * Only initialises when running inside a native Android shell.
 */
export function useRevenueCat(apiKey: string | undefined) {
  const [status, setStatus] = useState<RevenueCatStatus>({
    subscribed: false,
    productId: null,
    loading: true,
  });
  const [purchases, setPurchases] = useState<any>(null);

  // Lazy-load the SDK only on Android
  useEffect(() => {
    if (!isAndroid() || !apiKey) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        await Purchases.configure({ apiKey });
        if (!cancelled) setPurchases(Purchases);
        // Check initial entitlements
        const info = await Purchases.getCustomerInfo();
        if (!cancelled) {
          const entitlements = info.customerInfo.entitlements.active;
          const hasBoosted = !!entitlements[RC_ENTITLEMENTS.boosted];
          const hasPremium = !!entitlements[RC_ENTITLEMENTS.premium];
          setStatus({
            subscribed: hasBoosted || hasPremium,
            productId: hasPremium
              ? RC_PRODUCT_IDS.premium
              : hasBoosted
              ? RC_PRODUCT_IDS.boosted
              : null,
            loading: false,
          });
        }
      } catch (err) {
        console.error("[RevenueCat] Init error:", err);
        if (!cancelled) setStatus((prev) => ({ ...prev, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const purchaseProduct = useCallback(
    async (productId: string) => {
      if (!purchases) return false;
      try {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;
        if (!currentOffering) {
          console.error("[RevenueCat] No current offering");
          return false;
        }

        // Find the package matching the product
        const pkg = currentOffering.availablePackages.find(
          (p: any) => p.product.identifier === productId
        );
        if (!pkg) {
          console.error("[RevenueCat] Package not found:", productId);
          return false;
        }

        const result = await Purchases.purchasePackage({ aPackage: pkg });
        const entitlements = result.customerInfo.entitlements.active;
        const hasBoosted = !!entitlements[RC_ENTITLEMENTS.boosted];
        const hasPremium = !!entitlements[RC_ENTITLEMENTS.premium];

        setStatus({
          subscribed: hasBoosted || hasPremium,
          productId: hasPremium
            ? RC_PRODUCT_IDS.premium
            : hasBoosted
            ? RC_PRODUCT_IDS.boosted
            : null,
          loading: false,
        });

        return true;
      } catch (err: any) {
        if (err?.userCancelled) return false;
        console.error("[RevenueCat] Purchase error:", err);
        return false;
      }
    },
    [purchases]
  );

  const restorePurchases = useCallback(async () => {
    if (!purchases) return;
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const info = await Purchases.restorePurchases();
      const entitlements = info.customerInfo.entitlements.active;
      const hasBoosted = !!entitlements[RC_ENTITLEMENTS.boosted];
      const hasPremium = !!entitlements[RC_ENTITLEMENTS.premium];
      setStatus({
        subscribed: hasBoosted || hasPremium,
        productId: hasPremium
          ? RC_PRODUCT_IDS.premium
          : hasBoosted
          ? RC_PRODUCT_IDS.boosted
          : null,
        loading: false,
      });
    } catch (err) {
      console.error("[RevenueCat] Restore error:", err);
    }
  }, [purchases]);

  return {
    ...status,
    isBoosted: status.subscribed,
    purchaseProduct,
    restorePurchases,
    RC_PRODUCT_IDS,
  };
}
