import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ScanMode } from "@/hooks/useSpiritBox";

interface OscilloscopeProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
  isScanning: boolean;
  mode: ScanMode;
}

const MODE_COLORS: Record<ScanMode, { stroke: string; glow: string }> = {
  fm: { stroke: "hsl(175, 70%, 45%)", glow: "hsl(175, 70%, 45%)" },
  am: { stroke: "hsl(45, 90%, 55%)", glow: "hsl(45, 90%, 55%)" },
  whitenoise: { stroke: "hsl(0, 0%, 70%)", glow: "hsl(0, 0%, 80%)" },
  evp: { stroke: "hsl(260, 60%, 65%)", glow: "hsl(260, 60%, 65%)" },
};

export function Oscilloscope({ analyserRef, isScanning, mode }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const colors = MODE_COLORS[mode];

    ctx.clearRect(0, 0, width, height);

    // Scanline grid (subtle)
    ctx.strokeStyle = "hsla(175, 30%, 30%, 0.08)";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = "hsla(175, 30%, 40%, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Glow layer
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();

    // Second pass: thinner bright core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `${colors.stroke.replace(")", ", 0.6)").replace("hsl(", "hsla(")}`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }, [analyserRef, mode]);

  // Idle flatline animation when not scanning
  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "hsla(175, 30%, 30%, 0.06)";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Flatline with subtle pulse
    const t = Date.now() / 2000;
    ctx.strokeStyle = "hsla(175, 40%, 40%, 0.25)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "hsl(175, 70%, 45%)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * 0.02 + t) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(drawIdle);
  }, []);

  useEffect(() => {
    // Set canvas resolution to match display
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      // Reset to CSS dimensions for drawing
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    if (isScanning) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      rafRef.current = requestAnimationFrame(drawIdle);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isScanning, draw, drawIdle]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={cn(
        "bg-black/80 border-2 rounded-xl overflow-hidden relative",
        isScanning ? "border-primary/40" : "border-border/30"
      )}>
        <div className="absolute top-2 left-3 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono z-10">
          Waveform
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-24"
          style={{ imageRendering: "auto" }}
        />
        {isScanning && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-red-400/70">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
