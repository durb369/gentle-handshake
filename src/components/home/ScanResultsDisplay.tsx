import { Eye, Radar } from "lucide-react";
import { AnalysisResults } from "@/components/AnalysisResults";
import { EntityHighlightOverlay } from "@/components/EntityHighlightOverlay";
import { SpiritRadar } from "@/components/SpiritRadar";
import type { AnalysisResult, Finding } from "@/hooks/useSpiritScan";

interface ScanResultsDisplayProps {
  results: AnalysisResult;
  currentImage: string | null;
  selectedFinding: number | null;
  onSelectFinding: (index: number | null) => void;
  isBoosted?: boolean;
  onUpgrade?: (email?: string) => Promise<string | null>;
  onGenerateSketch?: (finding: Finding, index: number) => Promise<void>;
  isGeneratingSketch?: boolean;
  generatingSketchIndex?: number | null;
}

export function ScanResultsDisplay({
  results,
  currentImage,
  selectedFinding,
  onSelectFinding,
  isBoosted = false,
  onUpgrade,
  onGenerateSketch,
  isGeneratingSketch = false,
  generatingSketchIndex = null,
}: ScanResultsDisplayProps) {
  const hasEntityLocations = results.findings.some((f) => f.boundingBox);

  return (
    <div className="space-y-8">
      {/* Spirit & Energy Radar */}
      {results.findings.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Radar className="w-6 h-6 text-primary" />
            Spirit & Energy Radar
          </h3>
          <div className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
            <SpiritRadar 
              findings={results.findings} 
              overallEnergy={results.overallEnergy} 
            />
          </div>
        </div>
      )}

      {currentImage && hasEntityLocations && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Eye className="w-6 h-6 text-primary" />
            Entity Locations Revealed
          </h3>
          <EntityHighlightOverlay
            imageUrl={currentImage}
            findings={results.findings}
            selectedFinding={selectedFinding}
            onSelectFinding={onSelectFinding}
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
        isBoosted={isBoosted}
        onUpgrade={onUpgrade}
        onGenerateSketch={onGenerateSketch}
        isGeneratingSketch={isGeneratingSketch}
        generatingSketchIndex={generatingSketchIndex}
      />
    </div>
  );
}
