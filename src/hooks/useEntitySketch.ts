import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";
import type { Finding } from "@/hooks/useSpiritScan";

interface SketchResult {
  sketchUrl: string;
  sketchId: string;
}

export function useEntitySketch() {
  const deviceId = useDeviceId();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const generateSketch = useCallback(async (
    finding: Finding,
    findingIndex: number,
    scanId?: string
  ): Promise<SketchResult | null> => {
    if (!deviceId) {
      toast.error("Device ID not available");
      return null;
    }

    setIsGenerating(true);
    setGeneratingIndex(findingIndex);

    try {
      const { data, error } = await supabase.functions.invoke("generate-entity-sketch", {
        body: {
          deviceId,
          entityType: finding.entityType || finding.type,
          entityDescription: finding.description,
          intent: finding.intent,
          powerLevel: finding.powerLevel,
          scanId,
          findingIndex,
        },
      });

      if (error) {
        const status = (error as any)?.context?.status ?? (error as any)?.status;
        if (status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
          return null;
        }
        if (status === 429) {
          toast.error("Rate limit reached. Please wait before trying again.");
          return null;
        }
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Entity sketch generated and saved to gallery!");
      
      return {
        sketchUrl: data.sketch_url,
        sketchId: data.sketch_id,
      };
    } catch (error) {
      console.error("Error generating sketch:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate sketch");
      return null;
    } finally {
      setIsGenerating(false);
      setGeneratingIndex(null);
    }
  }, [deviceId]);

  return {
    generateSketch,
    isGenerating,
    generatingIndex,
  };
}
