import { Radio, Gauge, AudioLines, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ScanMode, SCAN_MODE_INFO } from "@/hooks/useSpiritBox";

const ICONS: Record<ScanMode, React.ReactNode> = {
  fm: <Radio className="w-4 h-4" />,
  am: <Gauge className="w-4 h-4" />,
  whitenoise: <AudioLines className="w-4 h-4" />,
  evp: <Mic className="w-4 h-4" />,
};

interface ScanModeSelectorProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
  disabled?: boolean;
}

export function ScanModeSelector({ mode, onChange, disabled }: ScanModeSelectorProps) {
  const modes: ScanMode[] = ["fm", "am", "whitenoise", "evp"];

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase tracking-widest text-center">Scan Mode</div>
      <div className="grid grid-cols-4 gap-1.5">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-xs font-medium transition-all",
              mode === m
                ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_hsl(175_70%_45%/0.15)]"
                : "bg-background/30 border-border/50 text-muted-foreground hover:bg-muted/30 hover:border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {ICONS[m]}
            <span className="leading-tight">{SCAN_MODE_INFO[m].label}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center italic">
        {SCAN_MODE_INFO[mode].description}
      </p>
    </div>
  );
}
