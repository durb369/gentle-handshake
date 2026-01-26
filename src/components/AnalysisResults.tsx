import { 
  Eye, MapPin, Sparkles, AlertCircle, Shield, AlertTriangle, 
  Heart, Zap, Moon, Sun, Skull, Ghost, Star, Flame 
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AnalysisResultsProps {
  findings: Finding[];
  overallReading?: OverallReading;
  synthesis?: string;
  guidance?: Guidance;
  interpretation?: string;
  overallEnergy: string;
}

const energyConfig: Record<string, { gradient: string; icon: typeof Sun; label: string }> = {
  blessed: { gradient: "from-amber-500/20 to-yellow-500/20 border-amber-500/40", icon: Sun, label: "Blessed" },
  protected: { gradient: "from-blue-500/20 to-cyan-500/20 border-blue-500/40", icon: Shield, label: "Protected" },
  positive: { gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40", icon: Heart, label: "Positive" },
  neutral: { gradient: "from-slate-500/20 to-gray-500/20 border-slate-500/40", icon: Moon, label: "Neutral" },
  mysterious: { gradient: "from-violet-500/20 to-purple-500/20 border-violet-500/40", icon: Sparkles, label: "Mysterious" },
  concerning: { gradient: "from-orange-500/20 to-amber-500/20 border-orange-500/40", icon: AlertTriangle, label: "Concerning" },
  dangerous: { gradient: "from-red-500/20 to-rose-500/20 border-red-500/40", icon: Skull, label: "Dangerous" },
  transformative: { gradient: "from-cyan-500/20 to-blue-500/20 border-cyan-500/40", icon: Zap, label: "Transformative" },
  awakening: { gradient: "from-violet-500/20 to-pink-500/20 border-violet-500/40", icon: Star, label: "Awakening" },
  warning: { gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/40", icon: AlertTriangle, label: "Warning" },
};

const intentColors: Record<string, string> = {
  benevolent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  malevolent: "bg-red-500/20 text-red-400 border-red-500/30",
  neutral: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  protective: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  parasitic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  observing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  communicating: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const powerColors: Record<string, string> = {
  faint: "text-muted-foreground",
  weak: "text-slate-400",
  moderate: "text-blue-400",
  strong: "text-violet-400",
  powerful: "text-amber-400",
  ancient: "text-red-400",
};

const typeIcons: Record<string, string> = {
  angel: "👼",
  demon: "👿",
  ghost: "👻",
  spirit: "🌀",
  entity: "👁",
  interdimensional: "🌌",
  energy: "⚡",
  elemental: "🌿",
  symbol: "✨",
  message: "📜",
  anomaly: "🔮",
};

const protectionLevelColors: Record<string, string> = {
  none: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  basic: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  moderate: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  serious: "bg-orange-500/20 border-orange-500/40 text-orange-400",
  urgent: "bg-red-500/20 border-red-500/40 text-red-400",
};

export function AnalysisResults({ 
  findings, 
  overallReading,
  synthesis,
  guidance,
  interpretation,
  overallEnergy 
}: AnalysisResultsProps) {
  const energyData = energyConfig[overallEnergy] || energyConfig.mysterious;
  const EnergyIcon = energyData.icon;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overall Energy Banner */}
      <div className={cn(
        "p-6 rounded-2xl border bg-gradient-to-r backdrop-blur-sm relative overflow-hidden",
        energyData.gradient
      )}>
        <div className="absolute inset-0 bg-glow-gradient opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <EnergyIcon className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Spiritual Energy Detected
            </span>
          </div>
          <p className="text-3xl font-bold capitalize text-foreground">
            {energyData.label}
          </p>
        </div>
      </div>

      {/* Spiritual Activity Meters */}
      {overallReading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Spiritual Activity</p>
            <p className="text-lg font-semibold capitalize text-foreground">{overallReading.spiritualActivity}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Dominant Energy</p>
            <p className="text-lg font-semibold capitalize text-foreground">{overallReading.dominantEnergy}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Veil Status</p>
            <p className="text-lg font-semibold capitalize text-foreground">
              {overallReading.dimensionalThinning === "none" ? "Stable" : overallReading.dimensionalThinning}
            </p>
          </div>
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ghost className="w-6 h-6 text-primary" />
            Entities & Presences Detected ({findings.length})
          </h3>
          <div className="grid gap-4">
            {findings.map((finding, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-card/60 border border-border backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-mystic"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{typeIcons[finding.type] || "👁"}</span>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-foreground font-semibold text-lg">{finding.description}</p>
                      {finding.entityType && (
                        <p className="text-primary font-medium">{finding.entityType}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <MapPin className="w-3 h-3" />
                        {finding.location}
                      </span>
                      
                      {finding.intent && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded border font-medium",
                          intentColors[finding.intent] || intentColors.neutral
                        )}>
                          {finding.intent}
                        </span>
                      )}
                      
                      {finding.powerLevel && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded bg-muted font-medium",
                          powerColors[finding.powerLevel] || "text-muted-foreground"
                        )}>
                          ⚡ {finding.powerLevel}
                        </span>
                      )}

                      {finding.isAttached && (
                        <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          ATTACHED
                        </span>
                      )}
                    </div>

                    {finding.message && (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-accent italic">"{finding.message}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-card/50 border border-border text-center">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No distinct spiritual presences detected in this image. The veil may be thick here, or the spirits choose not to reveal themselves at this time.
          </p>
        </div>
      )}

      {/* Synthesis - The Big Picture */}
      {synthesis && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            The Unified Message
          </h3>
          <p className="text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap">
            {synthesis}
          </p>
        </div>
      )}

      {/* Guidance Section */}
      {guidance && (
        <div className="space-y-4">
          {/* Protection Status */}
          {guidance.protectionNeeded && (
            <div className={cn(
              "p-5 rounded-xl border-2",
              protectionLevelColors[guidance.protectionLevel] || protectionLevelColors.basic
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6" />
                <span className="font-bold text-lg uppercase tracking-wide">
                  {guidance.protectionLevel === "urgent" ? "⚠️ URGENT PROTECTION NEEDED" : 
                   guidance.protectionLevel === "serious" ? "Protection Recommended" :
                   "Light Protection Suggested"}
                </span>
              </div>
              {guidance.protectionMethods.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm uppercase tracking-wider opacity-80">Protection Methods:</p>
                  <ul className="space-y-1">
                    {guidance.protectionMethods.map((method, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Immediate Advice */}
          <div className="p-5 rounded-xl bg-card/60 border border-border">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              Immediate Guidance
            </h4>
            <p className="text-foreground/90">{guidance.immediateAdvice}</p>
          </div>

          {/* Spiritual Meaning */}
          <div className="p-5 rounded-xl bg-card/60 border border-border">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-violet-400" />
              Metaphysical Significance
            </h4>
            <p className="text-foreground/90">{guidance.spiritualMeaning}</p>
          </div>

          {/* Warnings */}
          {guidance.warnings && guidance.warnings.length > 0 && (
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
              <h4 className="font-bold text-red-400 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" />
                Warnings
              </h4>
              <ul className="space-y-2">
                {guidance.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2 text-red-300">
                    <span className="text-red-500">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blessings */}
          {guidance.blessings && guidance.blessings.length > 0 && (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5" />
                Blessings Received
              </h4>
              <ul className="space-y-2">
                {guidance.blessings.map((blessing, i) => (
                  <li key={i} className="flex items-start gap-2 text-emerald-300">
                    <span className="text-emerald-500">✦</span>
                    {blessing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ritual Recommendations */}
          {guidance.ritualRecommendations && guidance.ritualRecommendations.length > 0 && (
            <div className="p-5 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <h4 className="font-bold text-violet-400 flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5" />
                Recommended Rituals & Practices
              </h4>
              <ul className="space-y-2">
                {guidance.ritualRecommendations.map((ritual, i) => (
                  <li key={i} className="flex items-start gap-2 text-violet-300">
                    <span className="text-violet-500">◇</span>
                    {ritual}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Fallback interpretation for simpler responses */}
      {interpretation && !synthesis && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            Mystical Interpretation
          </h3>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {interpretation}
          </p>
        </div>
      )}
    </div>
  );
}
