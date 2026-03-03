import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Power, Volume2, Gauge, Trash2, ChevronDown, ChevronUp, Zap, Save, History, Clock, X, Loader2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useSpiritBox, type SpiritWord } from "@/hooks/useSpiritBox";
import { useSpiritBoxSessions, type SpiritBoxSession } from "@/hooks/useSpiritBoxSessions";
import { formatDistanceToNow, format } from "date-fns";

function FrequencyDisplay({ frequency, isScanning }: { frequency: number; isScanning: boolean }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-black/80 border-2 border-primary/40 rounded-xl p-6 font-mono text-center relative overflow-hidden">
        {isScanning && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">FM Frequency</div>
        <div className={cn(
          "text-5xl md:text-6xl font-bold tracking-wider transition-colors",
          isScanning ? "text-primary drop-shadow-[0_0_20px_hsl(175_70%_45%/0.6)]" : "text-muted-foreground/50"
        )}>
          {frequency.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">MHz</div>
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
              active ? i < 4 ? "bg-emerald-500" : i < 8 ? "bg-amber-500" : "bg-red-500" : "bg-muted/20"
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

function WordLog({ words, onClear, title, emptyMessage }: {
  words: SpiritWord[];
  onClear?: () => void;
  title?: string;
  emptyMessage?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{title || "Spirit Transcript"}</span>
          <span className="text-xs text-muted-foreground">({words.length} words)</span>
        </div>
        <div className="flex items-center gap-2">
          {onClear && words.length > 0 && (
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
                  {emptyMessage || "No spirit communications received yet. Start scanning to listen..."}
                </p>
              ) : (
                words.map((word, idx) => (
                  <motion.div
                    key={word.id || idx}
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

function SessionCard({ session, onView, onDelete }: {
  session: SpiritBoxSession;
  onView: () => void;
  onDelete: () => void;
}) {
  const duration = session.duration_seconds
    ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
    : "Unknown";

  const strongCount = (session.words as any[]).filter((w: any) => w.intensity === "strong").length;
  const clearCount = (session.words as any[]).filter((w: any) => w.intensity === "clear").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 border border-border rounded-lg p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {format(new Date(session.started_at), "MMM d, yyyy · h:mm a")}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-2 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
        <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{session.word_count} words</span>
        {strongCount > 0 && <span className="text-red-400">{strongCount} strong</span>}
        {clearCount > 0 && <span className="text-primary">{clearCount} clear</span>}
      </div>

      <Button variant="outline" size="sm" onClick={onView} className="w-full text-xs">
        View Transcript
      </Button>
    </motion.div>
  );
}

function SessionHistory({ sessions, loading, onView, onDelete, onRefresh }: {
  sessions: SpiritBoxSession[];
  loading: boolean;
  onView: (s: SpiritBoxSession) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) onRefresh(); }}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Saved Sessions</span>
          <span className="text-xs text-muted-foreground">({sessions.length})</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 max-h-96 overflow-y-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 italic">
                  No saved sessions yet. Record a scan to save it here.
                </p>
              ) : (
                sessions.map(s => (
                  <SessionCard key={s.id} session={s} onView={() => onView(s)} onDelete={() => onDelete(s.id)} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionViewer({ session, onClose }: { session: SpiritBoxSession; onClose: () => void }) {
  const words: SpiritWord[] = (session.words as any[]).map((w: any, i: number) => ({
    id: `saved-${i}`,
    word: w.word,
    frequency: w.frequency || 0,
    timestamp: new Date(w.timestamp || session.started_at),
    intensity: w.intensity || "faint",
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-foreground">Session Replay</h2>
          <p className="text-xs text-muted-foreground">
            {format(new Date(session.started_at), "MMM d, yyyy · h:mm a")} · {session.word_count} words
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <WordLog words={words} title="Session Transcript" emptyMessage="This session had no words captured." />
      </div>
    </motion.div>
  );
}

export default function SpiritBox() {
  const {
    isScanning, currentFrequency, scanSpeed, words, signalStrength,
    startScanning, stopScanning, setScanSpeed, setVolume, setTone, clearLog,
  } = useSpiritBox();

  const { sessions, loading, saving, fetchSessions, saveSession, deleteSession } = useSpiritBoxSessions();

  const [volume, setVolumeState] = useState(50);
  const [tone, setToneState] = useState(30);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [viewingSession, setViewingSession] = useState<SpiritBoxSession | null>(null);

  const handleStart = () => {
    setSessionStartTime(new Date());
    startScanning();
  };

  const handleStop = () => {
    stopScanning();
  };

  const handleSave = async () => {
    if (!sessionStartTime) return;
    await saveSession(sessionStartTime, new Date(), words);
    setSessionStartTime(null);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolumeState(val[0]);
    setVolume(val[0] / 100);
  };

  const handleToneChange = (val: number[]) => {
    setToneState(val[0]);
    setTone(val[0]);
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Radio className={cn("w-8 h-8 transition-colors", isScanning ? "text-primary animate-pulse" : "text-muted-foreground")} />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Spirit Box</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Scan radio frequencies to intercept communications from beyond the veil
          </p>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          <FrequencyDisplay frequency={currentFrequency} isScanning={isScanning} />

          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Signal Strength</div>
            <SignalMeter strength={signalStrength} isScanning={isScanning} />
          </div>

          {/* Controls */}
          <div className="bg-card/50 border border-border rounded-xl p-5 space-y-5 backdrop-blur-sm">
            <div className="flex justify-center gap-4">
              <Button
                onClick={isScanning ? handleStop : handleStart}
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

            {/* Save session button - show when stopped and has words */}
            {!isScanning && words.length > 0 && sessionStartTime && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
                  variant="outline"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? "Saving Session..." : `Save Session (${words.length} words)`}
                </Button>
              </motion.div>
            )}

            {/* Scan Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="w-4 h-4" />Scan Speed
                </div>
                <span className="text-xs font-mono text-primary">{scanSpeed}</span>
              </div>
              <Slider value={[scanSpeed]} onValueChange={(v) => setScanSpeed(v[0])} min={1} max={10} step={1} className="cursor-pointer" />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="w-4 h-4" />Volume
                </div>
                <span className="text-xs font-mono text-primary">{volume}%</span>
              </div>
              <Slider value={[volume]} onValueChange={handleVolumeChange} min={0} max={100} step={1} className="cursor-pointer" />
            </div>

            {/* Tone / Frequency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AudioLines className="w-4 h-4" />Tone
                </div>
                <span className="text-xs font-mono text-primary">{tone < 33 ? "Low" : tone < 66 ? "Mid" : "High"}</span>
              </div>
              <Slider value={[tone]} onValueChange={handleToneChange} min={0} max={100} step={1} className="cursor-pointer" />
            </div>
          </div>

          {/* Word Log */}
          <WordLog words={words} onClear={clearLog} />

          {/* Saved Sessions */}
          <SessionHistory
            sessions={sessions}
            loading={loading}
            onView={setViewingSession}
            onDelete={deleteSession}
            onRefresh={fetchSessions}
          />
        </div>
      </div>

      {/* Session Viewer Modal */}
      <AnimatePresence>
        {viewingSession && (
          <SessionViewer session={viewingSession} onClose={() => setViewingSession(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
