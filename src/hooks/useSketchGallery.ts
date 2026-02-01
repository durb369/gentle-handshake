import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";

export interface EntitySketch {
  id: string;
  device_id: string;
  scan_id: string | null;
  finding_index: number;
  entity_type: string;
  entity_description: string | null;
  sketch_url: string;
  created_at: string;
}

const CACHE_KEY = "spirit-vision-sketch-cache";

function getCachedSketches(): EntitySketch[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function setCachedSketches(sketches: EntitySketch[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(sketches));
  } catch {
    // Ignore storage errors
  }
}

export function useSketchGallery() {
  const deviceId = useDeviceId();
  const [sketches, setSketches] = useState<EntitySketch[]>(getCachedSketches);
  const [loading, setLoading] = useState(true);

  const fetchSketches = useCallback(async () => {
    if (!deviceId) return;

    try {
      const { data, error } = await supabase
        .from("entity_sketches")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sketches:", error);
        return;
      }

      const typedData = data as EntitySketch[];
      setSketches(typedData);
      setCachedSketches(typedData);
    } catch (error) {
      console.error("Error fetching sketches:", error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const addSketch = useCallback((sketch: EntitySketch) => {
    setSketches(prev => {
      const updated = [sketch, ...prev];
      setCachedSketches(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    fetchSketches();
  }, [fetchSketches]);

  return {
    sketches,
    loading,
    fetchSketches,
    addSketch,
  };
}
