import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ImageUploader } from "@/components/ImageUploader";
import { CreditErrorBanner } from "@/components/CreditErrorBanner";
import { ScanLimitBanner } from "@/components/ScanLimitBanner";
import {
  SpiritVisionHeader,
  ScanLoadingState,
  ScanResultsDisplay,
  SpiritVisionFooter,
} from "@/components/home";
import { useSpiritScan } from "@/hooks/useSpiritScan";
import { useSubscription } from "@/hooks/useSubscription";
import { useScanLimit } from "@/hooks/useScanLimit";
import { useEntitySketch } from "@/hooks/useEntitySketch";
import { Crown } from "lucide-react";
import type { Finding } from "@/hooks/useSpiritScan";

const Index = () => {
  const {
    isAnalyzing,
    results,
    currentImage,
    selectedFinding,
    setSelectedFinding,
    creditError,
    handleImageSelect,
    handleRetry,
    handleDismissError,
  } = useSpiritScan();

  const { isBoosted, startCheckout, loading: subscriptionLoading } = useSubscription();
  const { scanCount, remainingScans, hasReachedLimit, refreshScanCount } = useScanLimit(isBoosted);
  const { generateSketch, isGenerating, generatingIndex } = useEntitySketch();

  const handleUpgrade = useCallback(async () => {
    const url = await startCheckout();
    if (url) {
      window.open(url, "_blank");
    }
  }, [startCheckout]);

  const handleGenerateSketch = useCallback(async (finding: Finding, index: number) => {
    await generateSketch(finding, index, undefined, currentImage ?? undefined);
  }, [generateSketch, currentImage]);

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <SpiritVisionHeader />

        {/* Boosted Status */}
        {isBoosted && !subscriptionLoading && (
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium">
              <Crown className="w-4 h-4" />
              Boosted Active
            </span>
          </div>
        )}

        <main className="space-y-8">
          <CreditErrorBanner
            errorType={creditError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />

          <ScanLimitBanner
            scanCount={scanCount}
            remainingScans={remainingScans}
            hasReachedLimit={hasReachedLimit}
            isBoosted={isBoosted}
            onUpgrade={handleUpgrade}
          />

          <ImageUploader
            onImageSelect={(base64) => {
              handleImageSelect(base64);
              // Refresh scan count after successful scan
              setTimeout(refreshScanCount, 3000);
            }}
            isAnalyzing={isAnalyzing}
            disabled={creditError === "credits" || hasReachedLimit}
          />

          {isAnalyzing && <ScanLoadingState />}

          {results && !isAnalyzing && (
            <ScanResultsDisplay
              results={results}
              currentImage={currentImage}
              selectedFinding={selectedFinding}
              onSelectFinding={setSelectedFinding}
              isBoosted={isBoosted}
              onUpgrade={startCheckout}
              onGenerateSketch={handleGenerateSketch}
              isGeneratingSketch={isGenerating}
              generatingSketchIndex={generatingIndex}
            />
          )}
        </main>

        <SpiritVisionFooter />
      </div>
    </div>
  );
};

export default Index;
