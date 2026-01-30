import { ImageUploader } from "@/components/ImageUploader";
import { CreditErrorBanner } from "@/components/CreditErrorBanner";
import {
  SpiritVisionHeader,
  ScanLoadingState,
  ScanResultsDisplay,
  SpiritVisionFooter,
} from "@/components/home";
import { useSpiritScan } from "@/hooks/useSpiritScan";

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

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <SpiritVisionHeader />

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

          {isAnalyzing && <ScanLoadingState />}

          {results && !isAnalyzing && (
            <ScanResultsDisplay
              results={results}
              currentImage={currentImage}
              selectedFinding={selectedFinding}
              onSelectFinding={setSelectedFinding}
            />
          )}
        </main>

        <SpiritVisionFooter />
      </div>
    </div>
  );
};

export default Index;
