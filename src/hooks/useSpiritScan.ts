import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";

export type CreditErrorType = "credits" | "rateLimit" | null;

export interface BoundingBox {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface Finding {
  description: string;
  location: string;
  type: string;
  entityType?: string;
  intent?: string;
  powerLevel?: string;
  confidence: string;
  isAttached?: boolean;
  message?: string;
  boundingBox?: BoundingBox;
}

export interface OverallReading {
  dominantEnergy: string;
  spiritualActivity: string;
  dimensionalThinning: string;
  primaryMessage: string;
}

export interface Guidance {
  immediateAdvice: string;
  spiritualMeaning: string;
  protectionNeeded: boolean;
  protectionLevel: string;
  protectionMethods: string[];
  ritualRecommendations: string[];
  warnings: string[];
  blessings: string[];
}

export interface AnalysisResult {
  findings: Finding[];
  overallReading?: OverallReading;
  synthesis?: string;
  guidance?: Guidance;
  interpretation?: string;
  overallEnergy: string;
}

export function useSpiritScan() {
  const deviceId = useDeviceId();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<CreditErrorType>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleImageSelect = async (base64: string) => {
    if (!deviceId) {
      toast.error("Device ID not ready. Please try again.");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setCurrentImage(base64);
    setSelectedFinding(null);
    setCreditError(null);
    setPendingImage(base64);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64, deviceId },
      });

      if (error) {
        const status =
          (error as any)?.context?.status ??
          (error as any)?.status ??
          (error as any)?.cause?.status;
        const message =
          (error as any)?.message ??
          (error as any)?.error_description ??
          "";

        const looksLike402 =
          status === 402 ||
          /\b402\b/.test(message) ||
          (data?.error?.includes?.("usage limit") ?? false) ||
          (data?.error?.includes?.("add credits") ?? false) ||
          /usage limit|add credits|credits?/i.test(message);

        const looksLike429 =
          status === 429 ||
          /\b429\b/.test(message) ||
          (data?.error?.includes?.("Rate limit") ?? false) ||
          /rate limit|too many requests/i.test(message);

        if (looksLike402) {
          setCreditError("credits");
          toast.error("AI credits exhausted. Please add credits to continue.");
          setIsAnalyzing(false);
          return;
        }
        if (looksLike429) {
          setCreditError("rateLimit");
          toast.error("Rate limit reached. Please wait before trying again.");
          setIsAnalyzing(false);
          return;
        }
        throw error;
      }

      if (data?.error) {
        if (data.error.includes("usage limit") || data.error.includes("add credits")) {
          setCreditError("credits");
          toast.error("AI credits exhausted. Please add credits to continue.");
          setIsAnalyzing(false);
          return;
        }
        if (data.error.includes("Rate limit")) {
          setCreditError("rateLimit");
          toast.error("Rate limit reached. Please wait before trying again.");
          setIsAnalyzing(false);
          return;
        }
        throw new Error(data.error);
      }

      setResults(data);
      setPendingImage(null);
      toast.success("Spiritual scan complete. The veil has been lifted.");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze image"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = useCallback(() => {
    if (pendingImage) {
      handleImageSelect(pendingImage);
    }
  }, [pendingImage]);

  const handleDismissError = useCallback(() => {
    setCreditError(null);
  }, []);

  return {
    isAnalyzing,
    results,
    currentImage,
    selectedFinding,
    setSelectedFinding,
    creditError,
    handleImageSelect,
    handleRetry,
    handleDismissError,
  };
}
