import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Power, Volume2, Gauge, Trash2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useSpiritBox, type SpiritWord } from "@/hooks/useSpiritBox";

function FrequencyDisplay({ frequency, isScanning }: { frequency: number; isScanning: boolean }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* LED display */}
      <div className="bg-black/80 border-2 border-primary/40 rounded-xl p-6 font-mono text-center relative overflow-hidden">
        {/* Scan line effect */}
        {isScanning && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          FM Frequency
        </div>
        <div className={cn(
          "text-5xl md:text-6xl font-bold tracking-wider transition-colors",
          isScanning ? "text-primary drop-shadow-[0_0_20px_hsl(175_70%_45%/0.6)]" : "text-muted-foreground/50"
        )}>
          {frequency.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">MHz</div>

        {/* Frequency bar */}
        <div className="mt-4 h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
            style={{ width: `${((frequency - 87.5) / 20.5) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>87.5</span>
          <span>108.0</span>
        </div>
      </div>
    </div>
  );
}

function SignalMeter({ strength, isScanning }: { strength: number; isScanning: boolean }) {
  const bars = 12;
  return (
    <div className="flex items-end gap-1 h-10 justify-center">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i / bars) * 100;
        const active = isScanning && strength > threshold;
        return (
          <motion.div
            key={i}
            className={cn(
              "w-2 rounded-sm transition-colors",
              active
                ? i < 4 ? "bg-emerald-500" : i < 8 ? "bg-amber-500" : "bg-red-500"
                : "bg-muted/20"
            )}
            style={{ height: `${((i + 1) / bars) * 100}%` }}
            animate={active ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.3 }}
            transition={{ duration: 0.3, repeat: active ? Infinity : 0 }}
          />
        );
      })}
    </div>
  );
}

function WordIntensityBadge({ intensity }: { intensity: SpiritWord["intensity"] }) {
  return (
    <span className={cn(
      "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border font-medium",
      intensity === "strong" ? "bg-red-500/20 text-red-400 border-red-500/30"
        : intensity === "clear" ? "bg-primary/20 text-primary border-primary/30"
        : "bg-muted/20 text-muted-foreground border-muted/30"
    )}>
      {intensity}
    </span>
  );
}

function WordLog({ words, onClear }: { words: SpiritWord[]; onClear: () => void }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Spirit Transcript</span>
          <span className="text-xs text-muted-foreground">({words.length} words)</span>
        </div>
        <div className="flex items-center gap-2">
          {words.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 max-h-80 overflow-y-auto space-y-2">
              {words.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 italic">
                  No spirit communications received yet. Start scanning to listen...
                </p>
              ) : (
                words.map((word) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Zap className={cn(
                        "w-3 h-3 flex-shrink-0",
                        word.intensity === "strong" ? "text-red-400"
                          : word.intensity === "clear" ? "text-primary"
                          : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "font-mono text-sm truncate",
                        word.intensity === "strong" ? "text-foreground font-bold"
                          : word.intensity === "clear" ? "text-foreground"
                          : "text-muted-foreground italic"
                      )}>
                        "{word.word}"
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <WordIntensityBadge intensity={word.intensity} />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {word.frequency.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SpiritBox() {
  const {
    isScanning,
    currentFrequency,
    scanSpeed,
    words,
    signalStrength,
    startScanning,
    stopScanning,
    setScanSpeed,
    setVolume,
    clearLog,
  } = useSpiritBox();

  const [volume, setVolumeState] = useState(50);

  const handleVolumeChange = (val: number[]) => {
    setVolumeState(val[0]);
    setVolume(val[0] / 100);
  };

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Radio className={cn(
              "w-8 h-8 transition-colors",
              isScanning ? "text-primary animate-pulse" : "text-muted-foreground"
            )} />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Spirit Box</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Scan radio frequencies to intercept communications from beyond the veil
          </p>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Frequency Display */}
          <FrequencyDisplay frequency={currentFrequency} isScanning={isScanning} />

          {/* Signal Meter */}
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Signal Strength</div>
            <SignalMeter strength={signalStrength} isScanning={isScanning} />
          </div>

          {/* Controls */}
          <div className="bg-card/50 border border-border rounded-xl p-5 space-y-5 backdrop-blur-sm">
            {/* Power Button */}
            <div className="flex justify-center">
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                size="lg"
                className={cn(
                  "rounded-full w-20 h-20 p-0 transition-all",
                  isScanning
                    ? "bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                    : "bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(175_70%_45%/0.3)]"
                )}
              >
                <Power className="w-8 h-8" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {isScanning ? "Scanning... Tap to stop" : "Tap to start scanning"}
            </p>

            {/* Scan Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="w-4 h-4" />
                  Scan Speed
                </div>
                <span className="text-xs font-mono text-primary">{scanSpeed}</span>
              </div>
              <Slider
                value={[scanSpeed]}
                onValueChange={(v) => setScanSpeed(v[0])}
                min={1}
                max={10}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="w-4 h-4" />
                  Volume
                </div>
                <span className="text-xs font-mono text-primary">{volume}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Word Log */}
          <WordLog words={words} onClear={clearLog} />
        </div>
      </div>
    </div>
  );
}
