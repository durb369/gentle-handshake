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

  const uploadImageToStorage = async (base64: string): Promise<string | null> => {
    try {
      const base64Data = base64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      const fileName = `${deviceId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("spirit-scans")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("spirit-scans")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const saveScanToDatabase = async (
    imageUrl: string,
    analysisResult: AnalysisResult
  ) => {
    try {
      const { data: scanData, error: scanError } = await supabase
        .from("spirit_scans")
        .insert({
          device_id: deviceId,
          image_url: imageUrl,
          overall_energy: analysisResult.overallEnergy,
          synthesis: analysisResult.synthesis,
          interpretation: analysisResult.interpretation,
          dominant_energy: analysisResult.overallReading?.dominantEnergy,
          spiritual_activity: analysisResult.overallReading?.spiritualActivity,
          dimensional_thinning: analysisResult.overallReading?.dimensionalThinning,
          primary_message: analysisResult.overallReading?.primaryMessage,
          protection_needed: analysisResult.guidance?.protectionNeeded,
          protection_level: analysisResult.guidance?.protectionLevel,
        })
        .select()
        .single();

      if (scanError) throw scanError;

      if (analysisResult.findings.length > 0 && scanData) {
        const findings = analysisResult.findings.map((finding) => ({
          scan_id: scanData.id,
          entity_type: finding.entityType || finding.type,
          description: finding.description,
          location: finding.location,
          intent: finding.intent,
          power_level: finding.powerLevel,
          confidence: finding.confidence,
          is_attached: finding.isAttached || false,
          message: finding.message,
          x_percent: finding.boundingBox?.xPercent,
          y_percent: finding.boundingBox?.yPercent,
          width_percent: finding.boundingBox?.widthPercent,
          height_percent: finding.boundingBox?.heightPercent,
        }));

        const { error: findingsError } = await supabase
          .from("entity_findings")
          .insert(findings);

        if (findingsError) throw findingsError;
      }

      return true;
    } catch (error) {
      console.error("Error saving scan:", error);
      return false;
    }
  };

  const handleImageSelect = async (base64: string) => {
    setIsAnalyzing(true);
    setResults(null);
    setCurrentImage(base64);
    setSelectedFinding(null);
    setCreditError(null);
    setPendingImage(base64);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64 },
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

      const imageUrl = await uploadImageToStorage(base64);
      if (imageUrl) {
        await saveScanToDatabase(imageUrl, data);
        toast.success("Spiritual scan complete and saved to your journal.");
      } else {
        toast.success("Spiritual scan complete. The veil has been lifted.");
      }
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
