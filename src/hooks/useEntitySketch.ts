import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";
import type { Finding } from "@/hooks/useSpiritScan";

interface SketchResult {
  sketchUrl: string;
  sketchId: string;
}

// Helper to crop image to bounding box and return as base64
async function cropImageToBoundingBox(
  imageUrl: string,
  boundingBox: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // Calculate pixel coordinates from percentages
      const x = (boundingBox.xPercent / 100) * img.naturalWidth;
      const y = (boundingBox.yPercent / 100) * img.naturalHeight;
      const width = (boundingBox.widthPercent / 100) * img.naturalWidth;
      const height = (boundingBox.heightPercent / 100) * img.naturalHeight;
      
      // Add some padding (10%) to capture context around the entity
      const padding = 0.1;
      const paddedX = Math.max(0, x - width * padding);
      const paddedY = Math.max(0, y - height * padding);
      const paddedWidth = Math.min(img.naturalWidth - paddedX, width * (1 + padding * 2));
      const paddedHeight = Math.min(img.naturalHeight - paddedY, height * (1 + padding * 2));
      
      canvas.width = paddedWidth;
      canvas.height = paddedHeight;
      
      ctx.drawImage(
        img,
        paddedX, paddedY, paddedWidth, paddedHeight,
        0, 0, paddedWidth, paddedHeight
      );
      
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = imageUrl;
  });
}

export function useEntitySketch() {
  const deviceId = useDeviceId();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const generateSketch = useCallback(async (
    finding: Finding,
    findingIndex: number,
    scanId?: string,
    sourceImageUrl?: string
  ): Promise<SketchResult | null> => {
    if (!deviceId) {
      toast.error("Device ID not available");
      return null;
    }

    setIsGenerating(true);
    setGeneratingIndex(findingIndex);

    try {
      let croppedImageUrl: string | undefined;
      
      // If we have both source image and bounding box, crop the detected region
      if (sourceImageUrl && finding.boundingBox) {
        try {
          croppedImageUrl = await cropImageToBoundingBox(sourceImageUrl, finding.boundingBox);
        } catch (cropError) {
          console.warn("Failed to crop image, proceeding without source:", cropError);
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-entity-sketch", {
        body: {
          deviceId,
          entityType: finding.entityType || finding.type,
          entityDescription: finding.description,
          intent: finding.intent,
          powerLevel: finding.powerLevel,
          scanId,
          findingIndex,
          sourceImageUrl: croppedImageUrl,
          boundingBox: finding.boundingBox,
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

      toast.success("Entity sketch generated from your scan!");
      
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
