import { Paintbrush, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Finding } from "@/hooks/useSpiritScan";

interface EntitySketchButtonProps {
  finding: Finding;
  findingIndex: number;
  onGenerate: (finding: Finding, index: number) => Promise<void>;
  isGenerating: boolean;
  generatingIndex: number | null;
  isBoosted: boolean;
  onUpgradeClick?: () => void;
}

export function EntitySketchButton({
  finding,
  findingIndex,
  onGenerate,
  isGenerating,
  generatingIndex,
  isBoosted,
  onUpgradeClick,
}: EntitySketchButtonProps) {
  const isThisGenerating = isGenerating && generatingIndex === findingIndex;

  if (!isBoosted) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpgradeClick}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Lock className="w-4 h-4 mr-1" />
              Sketch
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade to Boosted to generate entity sketches</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onGenerate(finding, findingIndex)}
      disabled={isGenerating}
      className="border-primary/30 text-primary hover:bg-primary/10"
    >
      {isThisGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Paintbrush className="w-4 h-4 mr-1" />
          Generate Sketch
        </>
      )}
    </Button>
  );
}
