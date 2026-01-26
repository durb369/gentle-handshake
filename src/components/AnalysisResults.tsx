import { Eye, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Finding {
  description: string;
  location: string;
  type: string;
  confidence: string;
}

interface AnalysisResultsProps {
  findings: Finding[];
  interpretation: string;
  overallEnergy: string;
}

const energyColors: Record<string, string> = {
  positive: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  neutral: "from-slate-500/20 to-gray-500/20 border-slate-500/30",
  mysterious: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  warning: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  transformative: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
};

const confidenceColors: Record<string, string> = {
  certain: "bg-primary/20 text-primary border-primary/30",
  likely: "bg-accent/20 text-accent border-accent/30",
  possible: "bg-muted text-muted-foreground border-muted-foreground/30",
};

const typeIcons: Record<string, string> = {
  letter: "🔤",
  face: "👤",
  symbol: "✨",
  shape: "◆",
  pattern: "🌀",
  other: "👁",
};

export function AnalysisResults({ findings, interpretation, overallEnergy }: AnalysisResultsProps) {
  const energyClass = energyColors[overallEnergy] || energyColors.mysterious;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Energy Banner */}
      <div className={cn(
        "p-6 rounded-2xl border bg-gradient-to-r backdrop-blur-sm",
        energyClass
      )}>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Overall Energy
          </span>
        </div>
        <p className="text-2xl font-bold capitalize text-foreground">
          {overallEnergy}
        </p>
      </div>

      {/* Findings */}
      {findings.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Hidden Messages Found ({findings.length})
          </h3>
          <div className="grid gap-3">
            {findings.map((finding, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/30 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[finding.type] || typeIcons.other}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{finding.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {finding.location}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        confidenceColors[finding.confidence] || confidenceColors.possible
                      )}>
                        {finding.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-card/50 border border-border text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No distinct hidden messages were found in this image, but that doesn't mean there aren't any...
          </p>
        </div>
      )}

      {/* Interpretation */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          Mystical Interpretation
        </h3>
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {interpretation}
        </p>
      </div>
    </div>
  );
}
