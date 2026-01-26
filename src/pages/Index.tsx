import { useState } from "react";
import { Eye, Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Finding {
  description: string;
  location: string;
  type: string;
  confidence: string;
}

interface AnalysisResult {
  findings: Finding[];
  interpretation: string;
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
      toast.success("Analysis complete! Hidden messages revealed.");
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
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Hidden Message
            <span className="text-primary"> Revealer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload any image and let AI uncover the hidden patterns, symbols, and messages that lie beneath the surface.
          </p>
        </header>

        {/* Main content */}
        <main className="space-y-12">
          <ImageUploader
            onImageSelect={handleImageSelect}
            isAnalyzing={isAnalyzing}
          />

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 animate-pulse">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full blur-xl" />
              </div>
              <p className="mt-6 text-lg text-muted-foreground">
                Scanning for hidden messages...
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                Looking through smoke, shadows, and patterns
              </p>
            </div>
          )}

          {results && !isAnalyzing && (
            <AnalysisResults
              findings={results.findings}
              interpretation={results.interpretation}
              overallEnergy={results.overallEnergy}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground/60">
          <p>Powered by AI vision analysis</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
