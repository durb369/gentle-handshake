import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

interface EntityHighlightOverlayProps {
  imageUrl: string;
  findings: Finding[];
  selectedFinding?: number | null;
  onSelectFinding?: (index: number | null) => void;
}

const intentBorderColors: Record<string, string> = {
  benevolent: "border-emerald-400 shadow-emerald-400/50",
  malevolent: "border-red-400 shadow-red-400/50",
  neutral: "border-slate-400 shadow-slate-400/50",
  protective: "border-blue-400 shadow-blue-400/50",
  parasitic: "border-purple-400 shadow-purple-400/50",
  observing: "border-amber-400 shadow-amber-400/50",
  communicating: "border-cyan-400 shadow-cyan-400/50",
};

const typeEmojis: Record<string, string> = {
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

export function EntityHighlightOverlay({
  imageUrl,
  findings,
  selectedFinding,
  onSelectFinding,
}: EntityHighlightOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const findingsWithBoxes = findings.filter((f) => f.boundingBox);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-card/50 border border-border">
      {/* Image */}
      <img
        src={imageUrl}
        alt="Analyzed image"
        className="w-full h-auto max-h-[600px] object-contain"
      />

      {/* Entity Highlights */}
      {findingsWithBoxes.map((finding, index) => {
        const box = finding.boundingBox!;
        const isHovered = hoveredIndex === index;
        const isSelected = selectedFinding === index;
        const borderColor = intentBorderColors[finding.intent || "neutral"] || intentBorderColors.neutral;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "absolute border-2 rounded-lg cursor-pointer transition-all duration-300",
              borderColor,
              isHovered || isSelected
                ? "border-4 shadow-lg"
                : "border-2 shadow-md"
            )}
            style={{
              left: `${box.xPercent}%`,
              top: `${box.yPercent}%`,
              width: `${box.widthPercent}%`,
              height: `${box.heightPercent}%`,
              boxShadow: isHovered || isSelected
                ? `0 0 20px currentColor, inset 0 0 15px currentColor`
                : `0 0 10px currentColor`,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onSelectFinding?.(isSelected ? null : index)}
          >
            {/* Entity Label */}
            <div
              className={cn(
                "absolute -top-7 left-0 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap",
                "bg-background/90 backdrop-blur-sm border",
                borderColor
              )}
            >
              <span className="mr-1">{typeEmojis[finding.type] || "👁"}</span>
              {finding.entityType || finding.type}
            </div>

            {/* Scanning animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
                animate={{
                  top: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 rounded-tl" style={{ borderColor: 'currentColor' }} />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 rounded-tr" style={{ borderColor: 'currentColor' }} />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 rounded-bl" style={{ borderColor: 'currentColor' }} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 rounded-br" style={{ borderColor: 'currentColor' }} />
          </motion.div>
        );
      })}

      {/* Hover/Selected Info Popup */}
      <AnimatePresence>
        {(hoveredIndex !== null || selectedFinding !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-background/95 backdrop-blur-sm border border-border shadow-mystic"
          >
            {(() => {
              const idx = selectedFinding ?? hoveredIndex;
              if (idx === null) return null;
              const finding = findingsWithBoxes[idx];
              if (!finding) return null;

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeEmojis[finding.type] || "👁"}</span>
                    <div>
                      <p className="font-bold text-foreground">{finding.entityType || finding.type}</p>
                      <p className="text-xs text-muted-foreground">{finding.location}</p>
                    </div>
                    {finding.intent && (
                      <span className={cn(
                        "ml-auto text-xs px-2 py-1 rounded border font-medium",
                        finding.intent === "benevolent" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        finding.intent === "malevolent" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      )}>
                        {finding.intent}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">{finding.description}</p>
                  {finding.message && (
                    <p className="text-sm text-accent italic">"{finding.message}"</p>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      {findingsWithBoxes.length > 0 && (
        <div className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
          <p className="text-xs text-muted-foreground mb-1">
            {findingsWithBoxes.length} {findingsWithBoxes.length === 1 ? "entity" : "entities"} detected
          </p>
          <p className="text-xs text-primary">Click to select • Hover to preview</p>
        </div>
      )}
    </div>
  );
}
