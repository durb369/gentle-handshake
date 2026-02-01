import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";

const FREE_SCAN_LIMIT = 5;

export interface ScanLimitStatus {
  scanCount: number;
  remainingScans: number;
  hasReachedLimit: boolean;
  loading: boolean;
}

export function useScanLimit(isBoosted: boolean) {
  const deviceId = useDeviceId();
  const [status, setStatus] = useState<ScanLimitStatus>({
    scanCount: 0,
    remainingScans: FREE_SCAN_LIMIT,
    hasReachedLimit: false,
    loading: true,
  });

  const checkScanCount = useCallback(async () => {
    if (!deviceId) return;

    // Boosted users have unlimited scans
    if (isBoosted) {
      setStatus({
        scanCount: 0,
        remainingScans: Infinity,
        hasReachedLimit: false,
        loading: false,
      });
      return;
    }

    try {
      const { count, error } = await supabase
        .from("spirit_scans")
        .select("*", { count: "exact", head: true })
        .eq("device_id", deviceId);

      if (error) {
        console.error("Error checking scan count:", error);
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const scanCount = count ?? 0;
      const remainingScans = Math.max(0, FREE_SCAN_LIMIT - scanCount);
      const hasReachedLimit = scanCount >= FREE_SCAN_LIMIT;

      setStatus({
        scanCount,
        remainingScans,
        hasReachedLimit,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking scan count:", error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, [deviceId, isBoosted]);

  useEffect(() => {
    checkScanCount();
  }, [checkScanCount]);

  return {
    ...status,
    refreshScanCount: checkScanCount,
    FREE_SCAN_LIMIT,
  };
}
