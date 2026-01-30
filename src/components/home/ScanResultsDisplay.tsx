import { Eye } from "lucide-react";
import { AnalysisResults } from "@/components/AnalysisResults";
import { EntityHighlightOverlay } from "@/components/EntityHighlightOverlay";
import type { AnalysisResult, Finding } from "@/hooks/useSpiritScan";

interface ScanResultsDisplayProps {
  results: AnalysisResult;
  currentImage: string | null;
  selectedFinding: number | null;
  onSelectFinding: (index: number | null) => void;
}

export function ScanResultsDisplay({
  results,
  currentImage,
  selectedFinding,
  onSelectFinding,
}: ScanResultsDisplayProps) {
  const hasEntityLocations = results.findings.some((f) => f.boundingBox);

  return (
    <div className="space-y-8">
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
      />
    </div>
  );
}
