import { Sparkles } from "lucide-react";

export function ScanLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="absolute inset-0 w-20 h-20 bg-primary/30 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-xl font-semibold text-foreground animate-pulse">
          Piercing the Veil...
        </p>
        <p className="text-muted-foreground max-w-md">
          Scanning for spirits, entities, and interdimensional presences. Analyzing smoke patterns, shadows, and energy signatures.
        </p>
      </div>

      <div className="mt-6 flex gap-4 text-xs text-muted-foreground/60">
        <span className="animate-pulse">👁 Detecting entities</span>
        <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>🌀 Reading energy</span>
        <span className="animate-pulse" style={{ animationDelay: '1s' }}>🔮 Interpreting signs</span>
      </div>
    </div>
  );
}
