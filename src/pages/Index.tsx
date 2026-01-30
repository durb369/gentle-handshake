import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, Sparkles, Ghost, Shield, Moon, BookOpen, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { EntityHighlightOverlay } from "@/components/EntityHighlightOverlay";
import { CreditErrorBanner } from "@/components/CreditErrorBanner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";

type CreditErrorType = "credits" | "rateLimit" | null;

interface BoundingBox {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

interface Finding {
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

interface OverallReading {
  dominantEnergy: string;
  spiritualActivity: string;
  dimensionalThinning: string;
  primaryMessage: string;
}

interface Guidance {
  immediateAdvice: string;
  spiritualMeaning: string;
  protectionNeeded: boolean;
  protectionLevel: string;
  protectionMethods: string[];
  ritualRecommendations: string[];
  warnings: string[];
  blessings: string[];
}

interface AnalysisResult {
  findings: Finding[];
  overallReading?: OverallReading;
  synthesis?: string;
  guidance?: Guidance;
  interpretation?: string;
  overallEnergy: string;
}

const Index = () => {
  const deviceId = useDeviceId();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<CreditErrorType>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const uploadImageToStorage = async (base64: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const base64Data = base64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Upload to storage
      const fileName = `${deviceId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("spirit-scans")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
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
      // Insert scan
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

      // Insert entity findings
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
      // Analyze the image
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64 },
      });

      if (error) {
        // supabase-js may surface edge-function errors in multiple shapes.
        // We must be defensive here to prevent throwing on known 402/429 cases.
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

      // Upload image and save to database
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

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shadow-mystic">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <Link to="/journal">
              <Button variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Journal
              </Button>
            </Link>
            <Link to="/encyclopedia">
              <Button variant="outline" className="gap-2">
                <Book className="w-4 h-4" />
                Bestiary
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Spirit
            <span className="text-primary"> Vision</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            See beyond the veil. Detect spirits, entities, angels, demons, and interdimensional beings hidden in your photos.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
              <Ghost className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Entity Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
              <Moon className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Hidden Messages</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-muted-foreground">Protection Guidance</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="space-y-12">
          <CreditErrorBanner
            errorType={creditError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />

          <ImageUploader
            onImageSelect={handleImageSelect}
            isAnalyzing={isAnalyzing}
            disabled={creditError === "credits"}
          />

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              
              <div className="mt-8 text-center space-y-2">
                <p className="text-xl font-semibold text-foreground animate-pulse">
                  Piercing the Veil...
                </p>
                <p className="text-muted-foreground max-w-md">
                  Scanning for spirits, entities, and interdimensional presences. Analyzing smoke patterns, shadows, and energy signatures.
                </p>
              </div>

              <div className="mt-6 flex gap-4 text-xs text-muted-foreground/60">
                <span className="animate-pulse">👁 Detecting entities</span>
                <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>🌀 Reading energy</span>
                <span className="animate-pulse" style={{ animationDelay: '1s' }}>🔮 Interpreting signs</span>
              </div>
            </div>
          )}

          {results && !isAnalyzing && (
            <div className="space-y-8">
              {/* Image with entity highlights */}
              {currentImage && results.findings.some(f => f.boundingBox) && (
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Eye className="w-6 h-6 text-primary" />
                    Entity Locations Revealed
                  </h3>
                  <EntityHighlightOverlay
                    imageUrl={currentImage}
                    findings={results.findings}
                    selectedFinding={selectedFinding}
                    onSelectFinding={setSelectedFinding}
                  />
                </div>
              )}

              <AnalysisResults
                findings={results.findings}
                overallReading={results.overallReading}
                synthesis={results.synthesis}
                guidance={results.guidance}
                interpretation={results.interpretation}
                overallEnergy={results.overallEnergy}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground/60 mb-2">
            Powered by advanced AI spiritual vision
          </p>
          <p className="text-xs text-muted-foreground/40">
            The unseen world is always communicating. Are you listening?
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
