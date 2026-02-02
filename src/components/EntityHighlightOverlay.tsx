import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const intentColors: Record<string, { border: string; glow: string; bg: string; text: string }> = {
  benevolent: {
    border: "border-emerald-400",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.7),inset_0_0_20px_rgba(52,211,153,0.3)]",
    bg: "bg-emerald-500/30",
    text: "text-emerald-400",
  },
  malevolent: {
    border: "border-red-500",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.7),inset_0_0_20px_rgba(239,68,68,0.3)]",
    bg: "bg-red-500/30",
    text: "text-red-400",
  },
  neutral: {
    border: "border-slate-400",
    glow: "shadow-[0_0_25px_rgba(148,163,184,0.6),inset_0_0_15px_rgba(148,163,184,0.2)]",
    bg: "bg-slate-500/30",
    text: "text-slate-400",
  },
  protective: {
    border: "border-blue-400",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.7),inset_0_0_20px_rgba(96,165,250,0.3)]",
    bg: "bg-blue-500/30",
    text: "text-blue-400",
  },
  parasitic: {
    border: "border-purple-500",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.7),inset_0_0_20px_rgba(168,85,247,0.3)]",
    bg: "bg-purple-500/30",
    text: "text-purple-400",
  },
  observing: {
    border: "border-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.7),inset_0_0_20px_rgba(251,191,36,0.3)]",
    bg: "bg-amber-500/30",
    text: "text-amber-400",
  },
  communicating: {
    border: "border-cyan-400",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.7),inset_0_0_20px_rgba(34,211,238,0.3)]",
    bg: "bg-cyan-500/30",
    text: "text-cyan-400",
  },
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

const glowColors: Record<string, string> = {
  benevolent: "52, 211, 153",
  malevolent: "239, 68, 68",
  neutral: "148, 163, 184",
  protective: "96, 165, 250",
  parasitic: "168, 85, 247",
  observing: "251, 191, 36",
  communicating: "34, 211, 238",
};

const getGlowColor = (intent: string | undefined, opacity: number): string => {
  const rgb = glowColors[intent || "neutral"] || glowColors.neutral;
  return `rgba(${rgb}, ${opacity})`;
};

export function EntityHighlightOverlay({
  imageUrl,
  findings,
  selectedFinding,
  onSelectFinding,
}: EntityHighlightOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomedEntity, setZoomedEntity] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const findingsWithBoxes = findings.filter((f) => f.boundingBox);

  const handleZoom = useCallback((index: number) => {
    setZoomedEntity(index);
    onSelectFinding?.(index);
  }, [onSelectFinding]);

  const handleCloseZoom = useCallback(() => {
    setZoomedEntity(null);
  }, []);

  const navigateEntity = useCallback((direction: 'prev' | 'next') => {
    if (zoomedEntity === null) return;
    const newIndex = direction === 'next' 
      ? (zoomedEntity + 1) % findingsWithBoxes.length
      : (zoomedEntity - 1 + findingsWithBoxes.length) % findingsWithBoxes.length;
    setZoomedEntity(newIndex);
    onSelectFinding?.(newIndex);
  }, [zoomedEntity, findingsWithBoxes.length, onSelectFinding]);

  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden bg-card/50 border border-border">
        {/* Image */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Analyzed image"
          className="w-full h-auto max-h-[600px] object-contain"
        />

        {/* Entity Highlights */}
        {findingsWithBoxes.map((finding, index) => {
          const box = finding.boundingBox!;
          const isHovered = hoveredIndex === index;
          const isSelected = selectedFinding === index;
          const colors = intentColors[finding.intent || "neutral"] || intentColors.neutral;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: isHovered || isSelected ? 1.02 : 1,
              }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="absolute cursor-pointer"
              style={{
                left: `${box.xPercent}%`,
                top: `${box.yPercent}%`,
                width: `${box.widthPercent}%`,
                height: `${box.heightPercent}%`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleZoom(index)}
            >
              {/* Outer glow layer - soft ambient */}
              <motion.div
                className="absolute -inset-4 rounded-[40%] blur-xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${getGlowColor(finding.intent, 0.5)} 0%, ${getGlowColor(finding.intent, 0.2)} 40%, transparent 70%)`,
                }}
                animate={{
                  opacity: isHovered || isSelected ? [0.8, 1, 0.8] : [0.5, 0.7, 0.5],
                  scale: isHovered || isSelected ? [1, 1.1, 1] : [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Middle glow layer - more intense */}
              <motion.div
                className="absolute -inset-2 rounded-[35%] blur-lg pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${getGlowColor(finding.intent, 0.7)} 0%, ${getGlowColor(finding.intent, 0.3)} 50%, transparent 80%)`,
                }}
                animate={{
                  opacity: isHovered || isSelected ? [0.7, 0.9, 0.7] : [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />

              {/* Inner core highlight */}
              <motion.div
                className="absolute inset-0 rounded-[30%] blur-md pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${getGlowColor(finding.intent, 0.6)} 0%, transparent 60%)`,
                }}
                animate={{
                  opacity: isHovered || isSelected ? [0.6, 0.8, 0.6] : [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Ethereal shimmer effect */}
              <motion.div
                className="absolute -inset-3 rounded-[40%] pointer-events-none overflow-hidden"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${getGlowColor(finding.intent, 0.4)}, transparent, ${getGlowColor(finding.intent, 0.2)}, transparent)`,
                  filter: 'blur(8px)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Entity Number Badge */}
              <motion.div
                className={cn(
                  "absolute -top-5 -left-5 w-8 h-8 rounded-full flex items-center justify-center z-10",
                  "bg-background/95 backdrop-blur-sm border-2 font-bold text-sm shadow-lg",
                  colors.border,
                  colors.text
                )}
                animate={{
                  scale: isHovered || isSelected ? [1, 1.15, 1] : 1,
                  boxShadow: isHovered || isSelected 
                    ? [`0 0 15px ${getGlowColor(finding.intent, 0.8)}`, `0 0 25px ${getGlowColor(finding.intent, 1)}`, `0 0 15px ${getGlowColor(finding.intent, 0.8)}`]
                    : `0 0 10px ${getGlowColor(finding.intent, 0.5)}`,
                }}
                transition={{
                  duration: 0.8,
                  repeat: isHovered || isSelected ? Infinity : 0,
                }}
              >
                {index + 1}
              </motion.div>

              {/* Entity Label */}
              <motion.div
                className={cn(
                  "absolute -top-9 left-5 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap z-10",
                  "bg-background/95 backdrop-blur-sm border-2 shadow-lg",
                  colors.border,
                  colors.text
                )}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <span className="mr-1.5 text-base">{typeEmojis[finding.type] || "👁"}</span>
                {finding.entityType || finding.type}
              </motion.div>

              {/* Zoom indicator on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div 
                      className={cn(
                        "p-3 rounded-full bg-background/90 backdrop-blur-sm border-2",
                        colors.border
                      )}
                      style={{
                        boxShadow: `0 0 20px ${getGlowColor(finding.intent, 0.8)}`,
                      }}
                    >
                      <ZoomIn className={cn("w-6 h-6", colors.text)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Hover/Selected Info Popup */}
        <AnimatePresence>
          {(hoveredIndex !== null || selectedFinding !== null) && zoomedEntity === null && (
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
                const colors = intentColors[finding.intent || "neutral"] || intentColors.neutral;

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
                          colors.bg, colors.text, colors.border
                        )}>
                          {finding.intent}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 gap-1"
                        onClick={() => handleZoom(idx)}
                      >
                        <Maximize2 className="w-4 h-4" />
                        Zoom
                      </Button>
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
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-background/90 backdrop-blur-sm border border-border">
            <p className="text-sm font-semibold text-foreground mb-1">
              {findingsWithBoxes.length} {findingsWithBoxes.length === 1 ? "entity" : "entities"} detected
            </p>
            <p className="text-xs text-primary">🔍 Click any entity to zoom in</p>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedEntity !== null && findingsWithBoxes[zoomedEntity] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={handleCloseZoom}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-background rounded-2xl border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const finding = findingsWithBoxes[zoomedEntity];
                const box = finding.boundingBox!;
                const colors = intentColors[finding.intent || "neutral"] || intentColors.neutral;

                // Calculate zoom crop - expand the box by 20% on each side for context
                const padding = 20;
                const cropX = Math.max(0, box.xPercent - padding);
                const cropY = Math.max(0, box.yPercent - padding);
                const cropWidth = Math.min(100 - cropX, box.widthPercent + padding * 2);
                const cropHeight = Math.min(100 - cropY, box.heightPercent + padding * 2);

                return (
                  <>
                    {/* Header */}
                    <div className={cn(
                      "sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm",
                      colors.border
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold",
                          colors.border, colors.bg, colors.text
                        )}>
                          {zoomedEntity + 1}
                        </div>
                        <div>
                          <h3 className={cn("text-xl font-bold flex items-center gap-2", colors.text)}>
                            <span className="text-2xl">{typeEmojis[finding.type] || "👁"}</span>
                            {finding.entityType || finding.type}
                          </h3>
                          <p className="text-sm text-muted-foreground">{finding.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {findingsWithBoxes.length > 1 && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => navigateEntity('prev')}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="text-sm text-muted-foreground px-2">
                              {zoomedEntity + 1} / {findingsWithBoxes.length}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => navigateEntity('next')}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCloseZoom}
                          className="ml-2"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Zoomed Image */}
                    <div className="relative overflow-hidden">
                      <div 
                        className="relative w-full"
                        style={{
                          // Use object-position to show the cropped area
                          minHeight: '300px',
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt="Zoomed entity view"
                          className="w-full h-auto"
                          style={{
                            clipPath: `inset(${cropY}% ${100 - cropX - cropWidth}% ${100 - cropY - cropHeight}% ${cropX}%)`,
                            transform: `scale(${100 / Math.max(cropWidth, cropHeight)})`,
                            transformOrigin: `${cropX + cropWidth/2}% ${cropY + cropHeight/2}%`,
                          }}
                        />
                        
                        {/* Highlight overlay on zoomed view */}
                        <motion.div
                          className={cn(
                            "absolute pointer-events-none border-4 rounded-lg",
                            colors.border,
                            colors.glow
                          )}
                          style={{
                            left: `${((box.xPercent - cropX) / cropWidth) * 100}%`,
                            top: `${((box.yPercent - cropY) / cropHeight) * 100}%`,
                            width: `${(box.widthPercent / cropWidth) * 100}%`,
                            height: `${(box.heightPercent / cropHeight) * 100}%`,
                          }}
                          animate={{
                            boxShadow: [
                              `0 0 20px currentColor, inset 0 0 10px currentColor`,
                              `0 0 40px currentColor, inset 0 0 20px currentColor`,
                              `0 0 20px currentColor, inset 0 0 10px currentColor`,
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      </div>
                    </div>

                    {/* Entity Details */}
                    <div className="p-6 space-y-4 border-t border-border">
                      <div className="flex flex-wrap gap-3">
                        {finding.intent && (
                          <div className={cn(
                            "px-4 py-2 rounded-lg border-2 font-semibold",
                            colors.border, colors.bg, colors.text
                          )}>
                            Intent: {finding.intent}
                          </div>
                        )}
                        {finding.powerLevel && (
                          <div className="px-4 py-2 rounded-lg border-2 border-primary/30 bg-primary/10 text-primary font-semibold">
                            Power: {finding.powerLevel}
                          </div>
                        )}
                        {finding.confidence && (
                          <div className="px-4 py-2 rounded-lg border-2 border-accent/30 bg-accent/10 text-accent font-semibold">
                            Confidence: {finding.confidence}
                          </div>
                        )}
                        {finding.isAttached && (
                          <div className="px-4 py-2 rounded-lg border-2 border-red-500/30 bg-red-500/10 text-red-400 font-semibold">
                            ⚠️ Attached Entity
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            Description
                          </h4>
                          <p className="text-foreground text-lg">{finding.description}</p>
                        </div>

                        {finding.message && (
                          <div className={cn("p-4 rounded-lg border-2", colors.border, colors.bg)}>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Message From Entity
                            </h4>
                            <p className={cn("text-lg italic", colors.text)}>"{finding.message}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
