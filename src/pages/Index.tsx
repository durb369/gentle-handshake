import { useState } from "react";
import { Eye, Sparkles, Ghost, Shield, Moon } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleImageSelect = async (base64: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64 },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
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
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shadow-mystic">
              <Eye className="w-8 h-8 text-primary" />
            </div>
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
          <ImageUploader
            onImageSelect={handleImageSelect}
            isAnalyzing={isAnalyzing}
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
            <AnalysisResults
              findings={results.findings}
              overallReading={results.overallReading}
              synthesis={results.synthesis}
              guidance={results.guidance}
              interpretation={results.interpretation}
              overallEnergy={results.overallEnergy}
            />
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
